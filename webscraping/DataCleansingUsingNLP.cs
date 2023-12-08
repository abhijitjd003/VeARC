using AutomatedDataCleansing.Models;
using Microsoft.ML;
using Serilog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutomatedDataCleansing
{
    public class DataCleansingUsingNLP
    {
        static MLContext MLContext = new MLContext();
        static DWProcessRepository _repo = new DWProcessRepository();
        static List<CarrierTransNamesCleanUp> dimCarrierTransNamesCleanUps = new List<CarrierTransNamesCleanUp>();
        static List<LOBTransCleanUp> dimLobtransCleanUps = new List<LOBTransCleanUp>();
        public DataCleansingUsingNLP()
        {
        }
        public void CleanseCarrierMappings()
        {
            try
            {
                Log.Information("Cleansing of Carrier Mapping using NLP started...");

                dimCarrierTransNamesCleanUps = _repo.GetTransCarrierNames();
                if (dimCarrierTransNamesCleanUps.Count > 0)
                {
                    List<CarrierCleansing> transCarrierNames = dimCarrierTransNamesCleanUps
                    .Select(x => new CarrierCleansing() { TransCarrierName = x.TransCarrierName }).ToList();
                    PredictCarrierNamesAndCompanyGroup(transCarrierNames);
                }

                Log.Information("Cleansing of Carrier Mappings using NLP completed...");
            }
            catch (Exception ex)
            {
                Log.Error("Class: DataCleansingUsingNLP, Method: CleanseCarrierMappings, Error: " + ex.Message, ex);
            }
        }
        public void CleanseLOBMappings()
        {
            try
            {
                Log.Information("Cleansing of LOB Mapping using NLP started...");

                dimLobtransCleanUps = _repo.GetTransLOBCodeAndDescriptions();
                if (dimLobtransCleanUps.Count > 0)
                {
                    List<LOBCleansing> transLOBCodeAndDescriptions = dimLobtransCleanUps
                        .Select(x => new LOBCleansing() { TransLOBCode = x.TransLOBCode, TransLOBDescription = x.TransLOBDescription }).ToList();
                    PredictLOBCodeAndDescriptions(transLOBCodeAndDescriptions);
                }

                Log.Information("Cleansing of LOB Mappings using NLP completed...");
            }
            catch (Exception ex)
            {
                Log.Error("Class: DataCleansingUsingNLP, Method: ExecuteNLP, Error: " + ex.Message, ex);
            }
        }


        private static void PredictCarrierNamesAndCompanyGroup(List<CarrierCleansing> TransParentCarrierName)
        {
            try
            {
                // Load Trained Model
                DataViewSchema predictionPipelineSchema;
                string carrierModelPath = ConfigurationManager.AppSettings["CarrierCleansingTrainedModelPath"];
                ITransformer predictionPipeline = MLContext.Model.Load(carrierModelPath, out predictionPipelineSchema);

                // Create PredictionEngines
                PredictionEngine<CarrierCleansing, CarrierMappingPredictionModel> predictionEngine = MLContext.Model.CreatePredictionEngine<CarrierCleansing, CarrierMappingPredictionModel>(predictionPipeline);
                IDataView predictions = predictionPipeline.Transform(MLContext.Data.LoadFromEnumerable<CarrierCleansing>(TransParentCarrierName));

                var predictionResults = MLContext.Data.CreateEnumerable<CarrierMappingPredictionModel>(predictions, reuseRowObject: false).ToList();
                var moreAccurateResults = predictionResults.Where(x => x.Score.Max() >= 0.5).OrderByDescending(x => x.Score.Max()).ToList();
                _repo.LogCarrierMappingCleansedResults(predictionResults, "NLP");

                List<CarrierMappingsCleanUp> cleansedCarrierData = _repo.GetCarrierMappingsData();
                foreach (var pred in moreAccurateResults)
                {
                    var carrierTransName = dimCarrierTransNamesCleanUps.Where(x => x.TransCarrierName == pred.TransCarrierName).FirstOrDefault();
                    if(carrierTransName !=null )
                    {
                        carrierTransName.MappedCarrierName = pred.PredictedCarrierName;
                        string historicCompanyGroup = cleansedCarrierData.Where(x => x.CleansedCompanyName == carrierTransName.MappedCarrierName).Select(companyGroup => companyGroup.CompanyGroup).FirstOrDefault();
                        if(historicCompanyGroup!=null)
                        {
                            carrierTransName.MappedCarrierGroup = historicCompanyGroup;
                        } else
                        {
                            carrierTransName.MappedCarrierGroup = pred.PredictedCompanyGroup;
                        }
                        carrierTransName.IsMapped = true;
                        // save result

                        Log.Information(string.Format($"Cleansed Company Name is : {pred.PredictedCarrierName}, Cleansed Company Group is : {pred.PredictedCompanyGroup} and prediction score is : {pred.Score.Max()}"));
                    }
                }

                if (dimCarrierTransNamesCleanUps.Count > 0)
                {
                    //Save CleansedCompanyNames to CarrierMappingCleanup table
                    _repo.SaveCarrierMappingsCleanup(dimCarrierTransNamesCleanUps, "NLP");

                    //Delete Mapped Data from CarrierTransNamesCleanup table
                    _repo.DeleteCarrierTransNamesCleanUps(dimCarrierTransNamesCleanUps);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: DataCleansingUsingNLP, Method: PredictCarrierNamesAndCompanyGroup, Error: " + ex.Message, ex);
            }
        }
        private static void PredictLOBCodeAndDescriptions(List<LOBCleansing> TransLOBCodeAndDescriptions)
        {
            try
            {
                // Load Trained Model
                DataViewSchema predictionPipelineSchema;
                string LOBModelPath = ConfigurationManager.AppSettings["LOBCleansingTrainedModelPath"];
                ITransformer predictionPipeline = MLContext.Model.Load(LOBModelPath, out predictionPipelineSchema);

                // Create PredictionEngines
                PredictionEngine<LOBCleansing, LOBMappingPredictionModel> predictionEngine = MLContext.Model.CreatePredictionEngine<LOBCleansing, LOBMappingPredictionModel>(predictionPipeline);
                IDataView predictions = predictionPipeline.Transform(MLContext.Data.LoadFromEnumerable<LOBCleansing>(TransLOBCodeAndDescriptions));

                var lobMappingPredictions = MLContext.Data.CreateEnumerable<LOBMappingPredictionModel>(predictions, reuseRowObject: false).ToList();
                _repo.LogLOBMappingCleansedResults(lobMappingPredictions, "NLP");

                lobMappingPredictions = lobMappingPredictions.Where(x => x.Score.Max() >= 0.5).OrderByDescending(x => x.Score.Max()).ToList();

                List<LOBMappingsCleanUp> cleansedLOBData = _repo.GetLOBMappingsData();
                foreach (var pred in lobMappingPredictions)
                {
                    var transLOB = dimLobtransCleanUps.Where(x => x.TransLOBCode == pred.TransLOBCode && x.TransLOBDescription == pred.TransLOBDescription).FirstOrDefault();
                    if (transLOB != null)
                    {                      
                        LOBMappingsCleanUp existingRecord = cleansedLOBData.Where(x => (x.CleansedLOBDescription?.ToLower() == pred.TransLOBDescription?.ToLower() || x.CleansedLOBCode?.ToLower() == pred.TransLOBCode?.ToLower() || x.CleansedLOBCode?.ToLower() == pred.TransLOBCode?.ToLower() && x.CleansedLOBDescription?.ToLower() == pred.TransLOBDescription?.ToLower()
                        || x.TransLOBCode?.ToLower() == pred.TransLOBCode?.ToLower() && x.TransLOBDescription?.ToLower() == pred.TransLOBDescription?.ToLower() && x.ModifiedBy != "NLP" || x.TransLOBDescription?.ToLower() == pred.TransLOBDescription?.ToLower() && x.ModifiedBy != "NLP"
                        || x.TransLOBCode?.ToLower() == pred.TransLOBCode?.ToLower() && x.ModifiedBy != "NLP") && x.CleansedLOBCode!=null && x.CleansedLOBDescription!=null).FirstOrDefault();

                        if (existingRecord != null)
                        {
                            transLOB.MappedLOBCode = existingRecord.CleansedLOBCode;
                            transLOB.MappedLOBDescription = existingRecord.CleansedLOBDescription;
                            transLOB.MappedLOBType = existingRecord.CleansedLOBType;
                            Log.Information(string.Format($"Cleansed LOB code is : {existingRecord.CleansedLOBCode}, Cleansed LOB Description is : {existingRecord.CleansedLOBDescription} and predicted using existing  record"));

                        }
                        else
                        {
                            transLOB.MappedLOBCode = pred.PredictedLOBCode;
                            transLOB.MappedLOBDescription = pred.PredictedLOBDescription;
                            transLOB.MappedLOBType = cleansedLOBData.Where(x => x.CleansedLOBCode == transLOB.MappedLOBCode && x.CleansedLOBDescription == transLOB.MappedLOBDescription).Select(businessType => businessType.CleansedLOBType).FirstOrDefault();
                            Log.Information(string.Format($"Cleansed LOB code is : {pred.PredictedLOBCode}, Cleansed LOB Description is : {pred.PredictedLOBDescription} and prediction score is : {pred.Score.Max()} and predcited using NLP."));
                        }
                        
                        transLOB.IsMapped = true;                      
                    }
                }

                if (dimLobtransCleanUps.Count > 0)
                {
                    //Save CleansedLOBCode and CleansedLOBDescription to LOBMappingCleanup table
                    _repo.SaveLOBMappingsCleanup(dimLobtransCleanUps, "NLP");

                    //Delete Mapped Data from LOBTransCleanUp table
                    _repo.DeleteLOBTransNamesCleanUps(dimLobtransCleanUps);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Class: DataCleansingUsingNLP, Method: PredictLOBCodeAndDescriptions, Error: " + ex.Message, ex);
            }
        }
    }
}
