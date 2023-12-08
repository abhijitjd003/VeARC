using AutomatedDataCleansing.Constants;
using AutomatedDataCleansing.Models;
using HtmlAgilityPack;
using Newtonsoft.Json;
using ScrapySharp.Extensions;
using Serilog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;

namespace AutomatedDataCleansing
{
    internal class WebScrapingMap
    {
        private static List<CarrierMappingPredictionModel> carrierMappingPredictionResults = new List<CarrierMappingPredictionModel>();
        public WebScrapingMap()
        {
        }

        public void ExecuteWebScraping()
        {
            try
            {
                DWProcessRepository _repo = new DWProcessRepository();
                List<CarrierTransNamesCleanUp> carrierTransNamesCleanUps = _repo.GetTransCarrierNames();
                Log.Information(string.Format("Number of carriers needs to be cleansed : {0}", carrierTransNamesCleanUps.Count()));

                if (carrierTransNamesCleanUps != null && carrierTransNamesCleanUps.Count() > 0)
                {
                    foreach (CarrierTransNamesCleanUp carrierTransNamesCleanUp in carrierTransNamesCleanUps)
                    {
                        if (!string.IsNullOrEmpty(carrierTransNamesCleanUp.TransCarrierName))
                        {
                            List<CustomSearchResultParam> customSearchResultParam = new List<CustomSearchResultParam>();

                            //Bloomberg Search - Step 1
                            Log.Information(string.Format("Bloomberg search started at : {0}", DateTime.Now.ToString()));
                            List<Metatag> bloombergResults = SearchQueryInBloomberg(carrierTransNamesCleanUp.TransCarrierName);
                            Log.Information(string.Format("Bloomberg search ended at : {0}", DateTime.Now.ToString()));

                            //DNB Search - Step 2
                            Log.Information(string.Format("DNB search started at : {0}", DateTime.Now.ToString()));
                            List<CustomSearchResultParam> dnbResults = SearchQueryInDNB(carrierTransNamesCleanUp.TransCarrierName);
                            Log.Information(string.Format("DNB search ended at : {0}", DateTime.Now.ToString()));

                            if (bloombergResults != null)
                            {
                                foreach (Metatag tag in bloombergResults)
                                {
                                    CustomSearchResultParam param = new CustomSearchResultParam()
                                    {
                                        title = tag.title,
                                        matchCount = tag.matchCount,
                                        score = tag.score,
                                    };
                                    customSearchResultParam.Add(param);
                                }
                            }
                            if (dnbResults != null && dnbResults.Count() > 0)
                                customSearchResultParam.AddRange(dnbResults);

                            if (customSearchResultParam.Count() == 0)
                            {
                                //Wikipedia Search - Step 3
                                Log.Information(string.Format("Wikipedia WebScraping started at : {0}", DateTime.Now.ToString()));
                                List<CustomSearchResultParam> webScrapeResults = WebScrapeFromWiki(carrierTransNamesCleanUp.TransCarrierName);
                                Log.Information(string.Format("Wikipedia WebScraping ended at : {0}", DateTime.Now.ToString()));

                                if (webScrapeResults == null || webScrapeResults.Count() == 0)
                                {
                                    //Insurance Providers Search - Step 4
                                    Log.Information(string.Format("Insurance Providers search started at : {0}", DateTime.Now.ToString()));
                                    List<CustomSearchResultParam> insProvResults = SearchQueryInInsuranceProviders(carrierTransNamesCleanUp.TransCarrierName);
                                    Log.Information(string.Format("Insurance Providers search ended at : {0}", DateTime.Now.ToString()));

                                    //Property & Casualty Search - Step 5
                                    Log.Information(string.Format("Property & Casualty search started at : {0}", DateTime.Now.ToString()));
                                    List<CustomSearchResultParam> pncResults = SearchQueryInPropertyAndCasualty(carrierTransNamesCleanUp.TransCarrierName);
                                    Log.Information(string.Format("Property & Casualty search ended at : {0}", DateTime.Now.ToString()));

                                    //Clearsurance Search - Step 6
                                    Log.Information(string.Format("Clearsurance search started at : {0}", DateTime.Now.ToString()));
                                    List<CustomSearchResultParam> clearsuranceResults = SearchQueryInClearsurance(carrierTransNamesCleanUp.TransCarrierName);
                                    Log.Information(string.Format("Clearsurance search ended at : {0}", DateTime.Now.ToString()));

                                    if (insProvResults != null && insProvResults.Count() > 0)
                                        customSearchResultParam.AddRange(insProvResults);
                                    if (pncResults != null && pncResults.Count() > 0)
                                        customSearchResultParam.AddRange(pncResults);
                                    if (clearsuranceResults != null && clearsuranceResults.Count() > 0)
                                        customSearchResultParam.AddRange(clearsuranceResults);
                                }
                                else if (webScrapeResults != null && webScrapeResults.Count() > 0)
                                {
                                    customSearchResultParam.AddRange(webScrapeResults);
                                }
                            }

                            if (customSearchResultParam.Count() > 0)
                            {
                                UpdateCleansedCompanyName(customSearchResultParam, carrierTransNamesCleanUp);
                            }
                            else
                            {
                                Log.Information("Cleansed company name not found for: " + carrierTransNamesCleanUp.TransCarrierName);
                            }
                        }
                    }
                }

                if (carrierTransNamesCleanUps != null && carrierTransNamesCleanUps.Count() > 0)
                {
                    //Save CleansedCompanyNames to CarrierMappingCleanup table
                    
                    
                    _repo.SaveCarrierMappingsCleanup(carrierTransNamesCleanUps, "WebScraping");

                    //Delete Mapped Data from CarrierTransNamesCleanup table
                    _repo.DeleteCarrierTransNamesCleanUps(carrierTransNamesCleanUps);

                    // Saving logs of webscrapping 
                    _repo.LogCarrierMappingCleansedResults(carrierMappingPredictionResults, "WebScraping");
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: ExecuteWebScrapingMap, Error: " + ex.Message, ex);
            }
        }

        //Update CleansedCompanyName/IsMapped into existing list
        private static void UpdateCleansedCompanyName(List<CustomSearchResultParam> customSearchResultParam, CarrierTransNamesCleanUp carrierTransNamesCleanUp)
        {
            try
            {
                DWProcessRepository _repo = new DWProcessRepository();
                var distinctfinalResult = (from result in customSearchResultParam
                                           select (new CustomSearchResultParam
                                           {
                                               title = result.title,
                                               matchCount = result.matchCount,
                                               score = result.score,
                                           })).Distinct();
                int maxMatchCount = distinctfinalResult.Max(x => x.matchCount);
                var data = distinctfinalResult.Where(x => x.matchCount == maxMatchCount && x.matchCount != 0);
                List<CarrierMappingsCleanUp> cleansedCarrierData = _repo.GetCarrierMappingsData();
                if (data != null && data.Count() > 0)
                {
                    string mappedCarrierName = data.Select(x => x.title).FirstOrDefault();
                    carrierTransNamesCleanUp.MappedCarrierName = mappedCarrierName;
                    string historicCompanyGroup = cleansedCarrierData.Where(x => x.CleansedCompanyName == carrierTransNamesCleanUp.MappedCarrierName).Select(companyGroup => companyGroup.CompanyGroup).FirstOrDefault();
                    if (historicCompanyGroup != null)
                    {
                        carrierTransNamesCleanUp.MappedCarrierGroup = historicCompanyGroup;
                    }
                    else
                    {
                        carrierTransNamesCleanUp.MappedCarrierGroup = mappedCarrierName;
                    }
                    carrierTransNamesCleanUp.IsMapped = true;

                    CarrierMappingPredictionModel prediction = new CarrierMappingPredictionModel();
                    prediction.PredictedCarrierName = carrierTransNamesCleanUp.MappedCarrierName;
                    prediction.TransCarrierName = carrierTransNamesCleanUp.TransCarrierName;
                    prediction.PredictedCompanyGroup = carrierTransNamesCleanUp.MappedCarrierGroup;
                    prediction.Score = new float[1];
                    prediction.Score[0] = data.Select(x => x.score).FirstOrDefault();
                    carrierMappingPredictionResults.Add(prediction);
                    
                    Log.Information(string.Format("Cleansed Company Name is : {0}", mappedCarrierName));
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: UpdateCleansedCompanyName, Error: " + ex.Message, ex);
            }
        }

        //Web Scraping
        private static List<CustomSearchResultParam> ExtractWebContent(string parentCarrierName, string wikiUrl, string cssSelectElements)
        {
            try
            {
                string[] parentCarrierWords = parentCarrierName.ToLower()
                    .Replace("-", " ").Replace("&", " ").Replace("!", " ")
                    .Replace("@", " ").Replace("#", " ").Replace("$", " ")
                    .Replace("%", " ").Replace("^", " ").Replace("*", " ")
                    .Replace("_", " ").Replace("+", " ").Replace("=", " ")
                    .Replace("insurance", "").Replace("company", "").Replace("association", "")
                    .Replace(" ins. ", "").Replace(" assoc. ", "").Replace(" co. ", "")
                    .Replace(" ins ", "").Replace(" assoc ", "").Replace(" co ", "")
                    .Trim().ToString().Split(' ');

                HtmlWeb web = new HtmlWeb();
                HtmlDocument doc = web.Load(wikiUrl);

                //Select a specific node from the HTML doc
                var Headers = doc.DocumentNode.CssSelect(cssSelectElements);
                var div = doc.DocumentNode.CssSelect("div .toc");
                var textsDoNotWant = div.CssSelect(cssSelectElements);

                //Extract the text and store it in a CSV file
                var parentCarrierCleanups = new List<CustomSearchResultParam>();
                if (Headers != null)
                {
                    foreach (var item in Headers)
                    {
                        bool isValid = true;
                        foreach (var text in textsDoNotWant)
                        {
                            if (text.InnerText == item.InnerText)
                                isValid = false;
                        }
                        if (isValid)
                        {
                            int matchingCounts = 0;
                            int originalCounts = 0;

                            string[] innerTexts = item.InnerText.ToLower()
                                    .Replace("-", " ").Replace("&", " ").Replace("!", " ")
                                    .Replace("@", " ").Replace("#", " ").Replace("$", " ")
                                    .Replace("%", " ").Replace("^", " ").Replace("*", " ")
                                    .Replace("_", " ").Replace("+", " ").Replace("=", " ")
                                    .Replace("insurance", "").Replace("company", "").Replace("association", "")
                                    .Replace(" ins. ", "").Replace(" assoc. ", "").Replace(" co. ", "")
                                    .Replace(" ins ", "").Replace(" assoc ", "").Replace(" co ", "")
                                    .Trim().ToString().Split(' ');

                            foreach (string dataDb in parentCarrierWords)
                            {
                                if (string.IsNullOrEmpty(dataDb))
                                {
                                    foreach (string dataWeb in innerTexts)
                                    {
                                        if (!string.IsNullOrEmpty(dataWeb.Trim()) && dataWeb.Trim() == dataDb.Trim())
                                        {
                                            matchingCounts++;
                                        }
                                    }
                                    originalCounts++;
                                }
                            }

                            int finalScore = 0;
                            if(originalCounts !=0 && matchingCounts!=0)
                            {
                                finalScore = matchingCounts / originalCounts;
                            }
                            parentCarrierCleanups.Add(new CustomSearchResultParam
                            {
                                title = item.InnerText,
                                matchCount = matchingCounts,
                                score = finalScore
                            });
                        }
                    }
                }

                if (parentCarrierCleanups.Count > 0)
                {
                    var distinctItems = (from result in parentCarrierCleanups
                                         select (new CustomSearchResultParam
                                         {
                                             title = result.title,
                                             matchCount = result.matchCount,
                                             score = result.score,
                                         })).Distinct();

                    int maxMatchCount = distinctItems.Max(x => x.matchCount);
                    List<CustomSearchResultParam> resultParams = distinctItems.Where(x => x.matchCount == maxMatchCount && x.matchCount != 0).ToList();

                    if (resultParams.Count == 1)
                        return resultParams;
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: ExtractWebContent, Error: " + ex.Message, ex);
            }
            return null;
        }

        //Search Bloomberg
        private static List<Metatag> SearchQueryInBloomberg(string transParentCarrierName)
        {
            try
            {
                string trimText = "- Company Profile and News";
                string url = ".bloomberg.com";
                string[] transParentCarrierNames = transParentCarrierName.ToLower()
                    .Replace("-", " ").Replace("&", " ").Replace("!", " ")
                    .Replace("@", " ").Replace("#", " ").Replace("$", " ")
                    .Replace("%", " ").Replace("^", " ").Replace("*", " ")
                    .Replace("_", " ").Replace("+", " ").Replace("=", " ")
                    .Replace("insurance", "").Replace("company", "").Replace("association", "")
                    .Replace(" ins. ", "").Replace(" assoc. ", "").Replace(" co. ", "")
                    .Replace(" ins ", "").Replace(" assoc ", "").Replace(" co ", "")
                    .Trim().ToString().Split(' ');

                CustomSearchResult results = SearchQueryInGoogle(transParentCarrierName, url);

                if (results != null && results.items != null && results.items.Count() > 0)
                {
                    foreach (CustomSearchResultParam data in results.items)
                    {
                        if (data.pagemap != null && data.pagemap.metatags != null && data.pagemap.metatags.Count() > 0)
                        {
                            foreach (Metatag tag in data.pagemap.metatags)
                            {
                                if (!string.IsNullOrEmpty(tag.title))
                                {
                                    string title = tag.title.Replace(trimText, string.Empty).Trim().ToString();
                                    string[] titles = title.ToLower().Replace("-", " ").Replace("&", " ").Replace("!", " ")
                                        .Replace("@", " ").Replace("#", " ").Replace("$", " ")
                                        .Replace("%", " ").Replace("^", " ").Replace("*", " ")
                                        .Replace("_", " ").Replace("+", " ").Replace("=", " ")
                                        .Replace("insurance", "").Replace("company", "").Replace("association", "")
                                        .Replace(" ins. ", "").Replace(" assoc. ", "").Replace(" co. ", "")
                                        .Replace(" ins ", "").Replace(" assoc ", "").Replace(" co ", "")
                                        .Trim().ToString().Split(' ');
                                    int matchingCounts = 0;
                                    int originalCounts = 0;

                                    foreach (string name in transParentCarrierNames)
                                    {
                                        if (!string.IsNullOrEmpty(name.Trim()))
                                        {
                                            foreach (string searchedName in titles)
                                            {
                                                if (!string.IsNullOrEmpty(searchedName.Trim()) && searchedName.Trim() == name.Trim())
                                                {
                                                    matchingCounts++;
                                                }
                                            }
                                            originalCounts++;
                                        }
                                    }
                                    tag.matchCount = matchingCounts;
                                    tag.title = title;
                                    tag.score = matchingCounts / originalCounts;
                                }
                            }
                        }
                    }

                    foreach (var result in results.items)
                    {
                        if (result.pagemap == null)
                        {
                            results.items.Remove(result);
                        }
                    }

                    var distinctItems = (from result in results.items
                                         from metatag in result.pagemap.metatags
                                         select (new Metatag
                                         {
                                             title = metatag.title,
                                             matchCount = metatag.matchCount,
                                             score = metatag.score,
                                         })).Distinct();
                    int maxMatchCount = distinctItems.Max(x => x.matchCount);
                    List<Metatag> metaTags = distinctItems.Where(x => x.matchCount == maxMatchCount && x.matchCount != 0).ToList();
                    return metaTags;
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: SearchQueryInBloomberg, Error: " + ex.Message, ex);
            }
            return null;
        }

        //Search DNB
        private static List<CustomSearchResultParam> SearchQueryInDNB(string transParentCarrierName)
        {
            try
            {
                string trimText = "Company Profile";
                string trimTex2 = "- Dun & Bradstreet";
                string url = ".dnb.com";
                string[] transParentCarrierNames = transParentCarrierName.ToLower()
                    .Replace("-", " ").Replace("&", " ").Replace("!", " ")
                    .Replace("@", " ").Replace("#", " ").Replace("$", " ")
                    .Replace("%", " ").Replace("^", " ").Replace("*", " ")
                    .Replace("_", " ").Replace("+", " ").Replace("=", " ")
                    .Replace("insurance", "").Replace("company", "").Replace("association", "")
                    .Replace(" ins. ", "").Replace(" assoc. ", "").Replace(" co. ", "")
                    .Replace(" ins ", "").Replace(" assoc ", "").Replace(" co ", "")
                    .Trim().ToString().Split(' ');

                CustomSearchResult results = SearchQueryInGoogle(transParentCarrierName, url);

                if (results != null && results.items != null && results.items.Count() > 0)
                {
                    foreach (CustomSearchResultParam data in results.items)
                    {
                        if (!string.IsNullOrEmpty(data.title))
                        {
                            string stringAfterChar = string.Empty;
                            string title = string.Empty;
                            int matchingCounts = 0;
                            int originalCounts = 0;

                            if (data.title.IndexOf(trimText) > -1)
                                stringAfterChar = data.title.Substring(data.title.IndexOf(trimText));
                            if (!string.IsNullOrEmpty(stringAfterChar))
                                title = data.title.Replace(stringAfterChar, string.Empty)
                                    .Replace(trimTex2, string.Empty).Trim().ToString();
                            string[] titles = title.ToLower().Replace("-", " ").Replace("&", " ").Replace("!", " ")
                                .Replace("@", " ").Replace("#", " ").Replace("$", " ")
                                .Replace("%", " ").Replace("^", " ").Replace("*", " ")
                                .Replace("_", " ").Replace("+", " ").Replace("=", " ")
                                .Replace("insurance", "").Replace("company", "").Replace("association", "")
                                .Replace(" ins. ", "").Replace(" assoc. ", "").Replace(" co. ", "")
                                .Replace(" ins ", "").Replace(" assoc ", "").Replace(" co ", "")
                                .Trim().ToString().Split(' ');

                            foreach (string name in transParentCarrierNames)
                            {
                                if (!string.IsNullOrEmpty(name.Trim()))
                                {
                                    foreach (string searchedName in titles)
                                    {
                                        if (!string.IsNullOrEmpty(searchedName.Trim()) && searchedName.Trim() == name.Trim())
                                        {
                                            matchingCounts++;
                                        }
                                    }
                                    originalCounts++;
                                }
                            }
                            data.matchCount = matchingCounts;
                            data.title = title;
                            data.score = matchingCounts / originalCounts;
                        }
                    }

                    var distinctItems = (from result in results.items
                                         select (new CustomSearchResultParam
                                         {
                                             title = result.title,
                                             matchCount = result.matchCount,
                                             score = result.score,
                                         })).Distinct();

                    int maxMatchCount = distinctItems.Max(x => x.matchCount);
                    List<CustomSearchResultParam> resultParams = distinctItems.Where(x => x.matchCount == maxMatchCount && x.matchCount != 0).ToList();
                    return resultParams;
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: SearchQueryInDNB, Error: " + ex.Message, ex);
            }
            return null;
        }

        //Search Insurance Providers
        private static List<CustomSearchResultParam> SearchQueryInInsuranceProviders(string transParentCarrierName)
        {
            try
            {
                string url = ".insuranceproviders.com";
                CustomSearchResult results = SearchQueryInGoogle(transParentCarrierName, url);

                if (results != null && results.items != null && results.items.Count() > 0)
                {
                    string urlLink = results.items[0].link;
                    return ExtractWebContent(transParentCarrierName, urlLink, "h1");
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: SearchQueryInInsuranceProviders, Error: " + ex.Message, ex);
            }
            return null;
        }

        //Search Property & Casualty
        private static List<CustomSearchResultParam> SearchQueryInPropertyAndCasualty(string transParentCarrierName)
        {
            try
            {
                string url = ".propertyandcasualty.com";
                CustomSearchResult results = SearchQueryInGoogle(transParentCarrierName, url);

                if (results != null && results.items != null && results.items.Count() > 0)
                {
                    string urlLink = results.items[0].link;
                    return ExtractWebContent(transParentCarrierName, urlLink, "h1.vm-doc-header");
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: SearchQueryInPropertyAndCasualty, Error: " + ex.Message, ex);
            }
            return null;
        }

        //Search Clearsurance
        private static List<CustomSearchResultParam> SearchQueryInClearsurance(string transParentCarrierName)
        {
            try
            {
                string url = ".clearsurance.com";
                CustomSearchResult results = SearchQueryInGoogle(transParentCarrierName, url);

                if (results != null && results.items != null && results.items.Count() > 0)
                {
                    string urlLink = results.items[0].link;
                    return ExtractWebContent(transParentCarrierName, urlLink, "div .title");
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: SearchQueryInClearsurance, Error: " + ex.Message, ex);
            }
            return null;
        }

        //Web Scraping Wikipedia
        private static List<CustomSearchResultParam> WebScrapeFromWiki(string transParentCarrierName)
        {
            string cssSelectElements = "ul > li > a";
            string wikiUrl = "https://en.wikipedia.org/wiki/List_of_United_States_insurance_companies";

            //Send the request to the server
            return ExtractWebContent(transParentCarrierName, wikiUrl, cssSelectElements);
        }

        //Google API Custom Search
        private static CustomSearchResult SearchQueryInGoogle(string transParentCarrierName, string searchUrlLike)
        {
            CustomSearchResult results = null;
            try
            {
                string apiKey = ConfigurationManager.AppSettings["GoogleApiKey"];
                string cx = ConfigurationManager.AppSettings["GoogleCX"];
                string apiUrl = ConfigurationManager.AppSettings["GoogleApiUrl"];

                string querySearch = transParentCarrierName.ToLower()
                    .Replace(" ins ", " insurance ")
                    .Replace(" ins. ", " insurance ")
                    .Replace(" assoc ", " association ")
                    .Replace(" assoc. ", " association ")
                    .Trim().ToString();
                querySearch = string.Format("{0} {1}", querySearch,
                    !querySearch.ToLower().Contains("insurance") ? "insurance" : string.Empty).Trim().ToString();

                var request = WebRequest.Create(apiUrl + "?key=" + apiKey
                    + "&cx=" + cx
                    + "&q=" + querySearch
                    + "&safe=" + GoogleCustomSearch.safe
                    + "&lr=" + GoogleCustomSearch.lr
                    + "&filter=" + GoogleCustomSearch.filter
                    + "&start=" + GoogleCustomSearch.start
                    + "&num=" + GoogleCustomSearch.num
                    + "&exactTerms=" + searchUrlLike);

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream dataStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                string responseText = reader.ReadToEnd();
                reader.Close();

                results = JsonConvert.DeserializeObject<CustomSearchResult>(responseText.ToString());
            }
            catch (Exception ex)
            {
                Log.Error("Class: WebScrapingMap, Method: SearchQueryInGoogle, Error: " + ex.Message, ex);
            }
            return results;
        }
    }
}
