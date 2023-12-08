using Azure.Storage;
using Azure.Storage.Files.DataLake;
using Azure.Storage.Sas;
using log4net;
using Rais.AzureFileStorageManager.Interfaces;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rais.AzureFileStorageManager
{
    public class ADLSFilesHelper: IADLSFileHelper
    {
        private readonly string adlsAccountName = ConfigurationManager.AppSettings["ADLSAccountName"];
        private readonly string fileSystemName = ConfigurationManager.AppSettings["ADLSfileSystemName"];
        private readonly string accountKey = ConfigurationManager.AppSettings["ADLSAccountKey"];

        private ILog Logger { get; set; }
        public ADLSFilesHelper(ILog _Logger)
        {
            Logger = _Logger;
        }
        public string  GenerateSASTokenForFiles(string destinationFile)
        {
            try
            {
                StorageSharedKeyCredential credential = new StorageSharedKeyCredential(adlsAccountName, accountKey);

                // Create the DataLakeServiceClient with the StorageSharedKeyCredential
                DataLakeServiceClient serviceClient = new DataLakeServiceClient(new Uri($"https://{adlsAccountName}.dfs.core.windows.net"), credential);

                // Get the file system client
                DataLakeFileSystemClient fileSystemClient = serviceClient.GetFileSystemClient(fileSystemName);


                BlobSasBuilder blobSasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = fileSystemName,
                    BlobName = destinationFile,
                    ExpiresOn = DateTime.UtcNow.AddMinutes(5),//SAS token expire after 5 minutes.
                };
                blobSasBuilder.SetPermissions(Azure.Storage.Sas.BlobSasPermissions.Read);//User will only be able to read the blob and it's properties
                string sasToken = blobSasBuilder.ToSasQueryParameters(new StorageSharedKeyCredential(adlsAccountName, accountKey)).ToString();               
                
                return sasToken;
            }
            catch (Exception ex)
            {
                return string.Empty;                
            }
        }

        public string GenerateblobSASUrl(string destinationFile)
        {
            return $"https://{adlsAccountName}.dfs.core.windows.net/{fileSystemName}/{destinationFile}";
        }


    }
}
