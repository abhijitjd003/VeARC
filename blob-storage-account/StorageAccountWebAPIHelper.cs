using Azure.Core;
using log4net;
using Newtonsoft.Json;
using Rais.AzureFileStorageManager.Interfaces;
using Rais.AzureFileStorageManager.Model;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Rais.AzureFileStorageManager
{
    public class StorageAccountWebAPIHelper : IStorageAccountWebAPIHelper
    {
        private readonly string tenantId = ConfigurationManager.AppSettings["AzureAD.TenantID"];
        private readonly string oauth2TokenUrl = ConfigurationManager.AppSettings["StorageAccount.OAuth2TokenUrl"];
        private readonly string client_id = ConfigurationManager.AppSettings["StorageAccount.ClientId"];
        private readonly string client_secret = ConfigurationManager.AppSettings["StorageAccount.ClientSecret"];
        private readonly string scope = ConfigurationManager.AppSettings["StorageAccount.Scope"];
        private readonly string updateUrl = ConfigurationManager.AppSettings["StorageAccount.UpdateUrl"];
        private readonly string resourceGroupName = ConfigurationManager.AppSettings["ResourceGroupName"];
        private readonly string subscriptionId = ConfigurationManager.AppSettings["SubscriptionId"];
        private readonly string storageAccountName = ConfigurationManager.AppSettings["ADLSAccountName"];

        private ILog Logger { get; set; }
        public StorageAccountWebAPIHelper(ILog _Logger)
        {
            Logger = _Logger;
        }

        public string GenerateTokenForStorageAccount()
        {
            string accessToken = string.Empty;
            try
            {
                ServicePointManager.ServerCertificateValidationCallback += (sender, cert, chain, sslPolicyErrors) => true;

                using (var handler = new HttpClientHandler { ServerCertificateCustomValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true })
                {
                    using (var httpClient = new HttpClient(handler))
                    {
                        string postUrl = oauth2TokenUrl.Replace("{tenant_id}", tenantId);
                        // Create the form-data content
                        var formDataContent = new MultipartFormDataContent();

                        // Add form-data fields
                        formDataContent.Add(new StringContent(client_id), "client_id");
                        formDataContent.Add(new StringContent(client_secret), "client_secret");
                        formDataContent.Add(new StringContent(scope), "scope");
                        formDataContent.Add(new StringContent("client_credentials"), "grant_type");

                        var response = httpClient.PostAsync(postUrl, formDataContent).Result;

                        if (response.IsSuccessStatusCode && response.StatusCode == HttpStatusCode.OK)
                        {
                            string result = response.Content.ReadAsStringAsync().Result;
                            var responseData = JsonConvert.DeserializeObject<StorageAccountToken>(result);
                            accessToken = $"{responseData.token_type} {responseData.access_token}";

                            Logger.Info("Token is generated successfully for storage account");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error("Error while generating token for storage account. Error " + ex.Message + " ", ex);
            }
            return accessToken;
        }

        public bool UpdateStorageAccountNetwork(string accessToken, string publicNetworkAction)
        {
            bool isUpdated = false;
            try
            {
                ServicePointManager.ServerCertificateValidationCallback += (sender, cert, chain, sslPolicyErrors) => true;

                using (var handler = new HttpClientHandler { ServerCertificateCustomValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true })
                {
                    using (var httpClient = new HttpClient(handler))
                    {
                        string patchUrl = updateUrl.Replace("{subscriptionId}", subscriptionId)
                            .Replace("{resourceGroupName}", resourceGroupName)
                            .Replace("{accountName}", storageAccountName);

                        string payload = "{\"properties\":{\"networkAcls\":{\"defaultAction\":\"public_network_action\"},\"publicNetworkAccess\":\"Enabled\"}}";
                        payload = payload.Replace("public_network_action", publicNetworkAction);

                        var request = new HttpRequestMessage
                        {
                            Method = new HttpMethod("PATCH"),
                            RequestUri = new Uri(patchUrl),
                            Content = new StringContent(payload, System.Text.Encoding.UTF8, "application/json")
                        };

                        httpClient.DefaultRequestHeaders.Clear();
                        httpClient.DefaultRequestHeaders.Add("Authorization", accessToken);

                        using (var response = httpClient.SendAsync(request).Result)
                        {
                            if (response.IsSuccessStatusCode && response.StatusCode == HttpStatusCode.OK)
                            {
                                isUpdated = true;
                                Logger.Info($"Public network access for storage account: {publicNetworkAction}");
                                Thread.Sleep(10000);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error("Error while updating network access for storage account. Error " + ex.Message + " ", ex);
            }
            return isUpdated;
        }
    }
}
