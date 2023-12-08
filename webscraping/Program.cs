using Serilog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutomatedDataCleansing
{
    class Program
    {
        static DataCleansingUsingNLP DataCleansingUsingNLP = new DataCleansingUsingNLP();
        static void Main(string[] args)
        {
            try
            {
                InitializeSerilog();
                //Executing NLP for Carrier Cleansing
                Log.Debug("Carrier Cleansing using NLP started..!");
                bool isRunNLP = Convert.ToBoolean(ConfigurationManager.AppSettings["RunNLP"]);
                if (isRunNLP)
                {
                    DataCleansingUsingNLP.CleanseCarrierMappings();
                }
                //Executing WebScraping for Carrier Cleansing
                bool isRunWebScraping = Convert.ToBoolean(ConfigurationManager.AppSettings["RunWebScraping"]);
                if (isRunWebScraping)
                {
                    Log.Debug("WebScraping execution started...!");
                    WebScrapingMap webScrapingMap = new WebScrapingMap();
                    webScrapingMap.ExecuteWebScraping();
                    Log.Debug("WebScraping execution completed...!");
                }

                //Executing NLP for LOB Cleansing
                DataCleansingUsingNLP.CleanseLOBMappings();

            }
            catch (Exception ex)
            {
                Log.Error("Class: Program, Method: Main, Error: " + ex.Message, ex);
            }
        }

        public static void InitializeSerilog()
        {
            string logFilePath = Path.Combine(ConfigurationManager.AppSettings["LogFileBasePath"], "log-{Date}.log");

            Log.Logger = new LoggerConfiguration()
                            .MinimumLevel.Debug()
                            .WriteTo.Console()
                            //.WriteTo.File("logs\\myapp.txt", rollingInterval: RollingInterval.Day)
                            .WriteTo.RollingFile(logFilePath)
                            .CreateLogger();
        }
    }
}
