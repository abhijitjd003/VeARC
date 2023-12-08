using Azure.Storage;
using Azure.Storage.Files.DataLake;
using Azure.Storage.Files.DataLake.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using log4net;
using Rais.AzureFileStorageManager.Interfaces;

namespace Rais.AzureFileStorageManager
{
    public class ADLSFileUploader: IADLSFileUploader
    {
        private readonly string adlsAccountName = ConfigurationManager.AppSettings["ADLSAccountName"];
        private readonly string fileSystemName = ConfigurationManager.AppSettings["ADLSfileSystemName"];
        private readonly string accountKey = ConfigurationManager.AppSettings["ADLSAccountKey"];
        private ILog Logger { get; set; }
        public ADLSFileUploader(ILog _Logger)
        {
            Logger = _Logger;
        }

        private Dictionary<string, string> mimeTypes = new Dictionary<string, string>()
{
    { ".ai", "application/postscript" },
    { ".aif", "audio/aiff" },
    { ".aifc", "audio/aiff" },
    { ".aiff", "audio/aiff" },
    { ".asc", "text/plain" },
    { ".asf", "video/x-ms-asf" },
    { ".asx", "video/x-ms-asf" },
    { ".au", "audio/basic" },
    { ".avi", "video/x-msvideo" },
    { ".bmp", "image/bmp" },
    { ".css", "text/css" },
    { ".csv", "text/csv" },
    { ".doc", "application/msword" },
    { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { ".eps", "application/postscript" },
    { ".gif", "image/gif" },
    { ".gz", "application/x-gzip" },
    { ".htm", "text/html" },
    { ".html", "text/html" },
    { ".ico", "image/x-icon" },
    { ".jpe", "image/jpeg" },
    { ".jpeg", "image/jpeg" },
    { ".jpg", "image/jpeg" },
    { ".js", "text/javascript" },
    { ".json", "application/json" },
    { ".mid", "audio/midi" },
    { ".midi", "audio/midi" },
    { ".mov", "video/quicktime" },
    { ".mp3", "audio/mpeg" },
    { ".mpeg", "video/mpeg" },
    { ".mpg", "video/mpeg" },
    { ".otf", "font/otf" },
    { ".pdf", "application/pdf" },
    { ".png", "image/png" },
    { ".ppt", "application/vnd.ms-powerpoint" },
    { ".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
    { ".ps", "application/postscript" },
    { ".psd", "image/vnd.adobe.photoshop" },
    { ".rar", "application/x-rar-compressed" },
    { ".rtf", "application/rtf" },
    { ".svg", "image/svg+xml" },
    { ".swf", "application/x-shockwave-flash" },
    { ".tar", "application/x-tar" },
    { ".tif", "image/tiff" },
    { ".tiff", "image/tiff" },
    { ".ttf", "font/ttf" },
    { ".txt", "text/plain" },
    { ".wav", "audio/wav" },
    { ".webm", "video/webm" },
    { ".wma", "audio/x-ms-wma" },
    { ".wmv", "video/x-ms-wmv" },
    { ".woff", "font/woff" },
    { ".woff2", "font/woff2" },
    { ".xls", "application/vnd.ms-excel" },
    { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { ".xml", "application/xml" },
    { ".zip", "application/zip" },
    // Add more mappings for other file types if needed
};


        public void UploadFilesToADLSFromLocalFolder(string localFolder, string destinationFolder)
        {
            try
            {
                DataLakeFileSystemClient fileSystemClient = GetFileSystemClient();
                // Create the destination folder in ADLS if it doesn't exist
                DataLakeDirectoryClient destinationFolderClient = fileSystemClient.GetDirectoryClient(destinationFolder);
                destinationFolderClient.CreateIfNotExists();
                // Move the entire content of the local folder recursively to the destination folder in ADLS
                UploadFolderContents(destinationFolderClient, localFolder);
            }
            catch (Exception ex)
            {
            }
        }

        private void  UploadFolderContents(DataLakeDirectoryClient directoryClient, string localFolderPath)
        {
            Logger.Info("Uploading file to ADLS");
            List<string> filesToUpload = Directory.GetFiles(localFolderPath).ToList();
            Parallel.ForEach(filesToUpload, (file) =>
            {
                string fileName = Path.GetFileName(file);
                string extension = Path.GetExtension(file);
                string contentType = GetContentType(extension);

                DataLakeFileClient fileClient = directoryClient.GetFileClient(fileName);

                using (FileStream stream = File.OpenRead(file))
                {
                    PathHttpHeaders options = new PathHttpHeaders
                    {
                        ContentType = contentType
                    };
                    fileClient.Upload(stream, httpHeaders: options);

                }
            });

            foreach (string subDirectory in Directory.GetDirectories(localFolderPath))
            {
                string directoryName = Path.GetFileName(subDirectory);
                DataLakeDirectoryClient subDirectoryClient = directoryClient.GetSubDirectoryClient(directoryName);

                if (!subDirectoryClient.Exists())
                {
                    subDirectoryClient.CreateIfNotExists();
                }

                UploadFolderContents(subDirectoryClient, subDirectory);
            }
        }

        public void UploadFileToADLS(HttpPostedFileBase uploadedFile, string destinationFolder, string fileName)
        {
            try
            {
                Logger.Info("Uploading file to ADLS "+ destinationFolder+" Folder");
                DataLakeFileSystemClient fileSystemClient = GetFileSystemClient();
                DataLakeDirectoryClient destinationFolderClient = fileSystemClient.GetDirectoryClient(destinationFolder);
                destinationFolderClient.CreateIfNotExists();
                // Move the entire content of the local folder recursively to the destination folder in ADLS
                using (var stream = uploadedFile.InputStream)
                {
                    // Create a DataLakeFileClient to upload the file
                    DataLakeFileClient fileClient = fileSystemClient.GetFileClient($"{destinationFolder}/{fileName}");

                    string contentType = uploadedFile.ContentType; // ContentType might provide the file's MIME type
                    PathHttpHeaders options = new PathHttpHeaders
                    {
                        ContentType = contentType
                    };
                    // Upload the file
                    fileClient.Upload(stream, httpHeaders: options);
                    // Update the content type after the upload
                }
                Logger.Info("File uploaded to ADLS " + destinationFolder + " Folder successfully");
            }
            catch (Exception ex)
            {
                Logger.Error("Error while uploading file to ADLS " + destinationFolder + " Folder. Error "+ex.Message+ " ",ex);
            }
        }

        public void DeleteFile(string destinationFolder, string fileName)
        {
            try
            {
                Logger.Info("Deleting file from ADLS " + destinationFolder + " Folder");
                DataLakeFileSystemClient fileSystemClient = GetFileSystemClient();
                // Get the directory client
                DataLakeDirectoryClient destinationFolderClient = fileSystemClient.GetDirectoryClient(destinationFolder);
                
                // Get the file client
                DataLakeFileClient fileClient = destinationFolderClient.GetFileClient(fileName);

                // Delete the file
                fileClient.DeleteIfExists();
                Logger.Info("Deleted file from ADLS " + destinationFolder + " Folder  successfully");
            }
            catch (Exception ex)
            {
                Logger.Error("Error while deleting file from ADLS " + destinationFolder + " Folder. Error " + ex.Message + " ", ex);
            }
        }

        public void DeleteFiles(string destinationFolder)
        {
            try
            {
                Logger.Info("Deleting file from ADLS " + destinationFolder + " Folder");
                DataLakeFileSystemClient fileSystemClient = GetFileSystemClient();
                // Get the directory client
                DataLakeDirectoryClient destinationFolderClient = fileSystemClient.GetDirectoryClient(destinationFolder);

                // Delete the file
                foreach (var file in destinationFolderClient.GetPaths())
                {
                    string fileName = file.Name.Replace(destinationFolder + "/", "");
                    DataLakeFileClient fileClient = destinationFolderClient.GetFileClient(fileName);
                    fileClient.DeleteIfExists();
                }
                Logger.Info("Deleted file from ADLS " + destinationFolder + " Folder  successfully");
            }
            catch (Exception ex)
            {
                Logger.Error("Error while deleting file from ADLS " + destinationFolder + " Folder. Error " + ex.Message + " ", ex);
            }
        }

        public string GetFileName(string destinationFolder)
        {
            string fileName = string.Empty;
            try
            {
                Logger.Info("Retreving file from ADLS " + destinationFolder + " Folder");
                DataLakeFileSystemClient fileSystemClient = GetFileSystemClient();
                // Get the directory client
                DataLakeDirectoryClient destinationFolderClient = fileSystemClient.GetDirectoryClient(destinationFolder);

                // Delete the file
                foreach (var file in destinationFolderClient.GetPaths())
                {
                    fileName = file.Name;
                }
                Logger.Info("File name  from ADLS " + destinationFolder + " Folder is ="+fileName);
            }
            catch (Exception ex)
            {
            }
            return fileName;
        }

        private DataLakeFileSystemClient GetFileSystemClient()
        {
            try
            {
                StorageSharedKeyCredential credential = new StorageSharedKeyCredential(adlsAccountName, accountKey);
                // Create the DataLakeServiceClient with the StorageSharedKeyCredential
                DataLakeServiceClient serviceClient = new DataLakeServiceClient(new Uri($"https://{adlsAccountName}.dfs.core.windows.net"), credential);
                // Get the file system client
                DataLakeFileSystemClient fileSystemClient = serviceClient.GetFileSystemClient(fileSystemName);                
                
                return fileSystemClient;
            }            
            catch (Exception ex)
            {
                return null;
            }
        }

        private string GetContentType(string filePath)
        {
            string extension = Path.GetExtension(filePath);
            if (mimeTypes.ContainsKey(extension))
            {
                return mimeTypes[extension];
            }
            else
            {
                // If the extension is not found in the dictionary, return a default content type or perform further analysis.
                return "application/octet-stream"; // Default content type
            }
        }
    }
}
