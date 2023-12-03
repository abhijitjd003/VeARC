# Databricks notebook source
# DBTITLE 1,Connect to Key Vault
# MAGIC %run /Shared/Common/KeyVaultConfig

# COMMAND ----------

# MAGIC %md #ADLS Connection

# COMMAND ----------

def AdlConfigs():
    configs = {"fs.azure.account.auth.type": "OAuth",
          "fs.azure.account.oauth.provider.type": "org.apache.hadoop.fs.azurebfs.oauth2.ClientCredsTokenProvider",
          "fs.azure.account.oauth2.client.id":  GetStorageClientId(),
          "fs.azure.account.oauth2.client.secret": GetStorageClientSecret(),
          "fs.azure.account.oauth2.client.endpoint":  "https://login.microsoftonline.com/"+GetTenantId()+"/oauth2/token"}
    return configs

# COMMAND ----------

storageName =  GetStorageName() #'ivansdev'

# COMMAND ----------

def CreateMountPath (storageName, containerName, configs):
    mountPoint = "/mnt/"+containerName
    uri = 'abfss://' + containerName + '@' + storageName + '.dfs.core.windows.net/'
    
    try:
        dbutils.fs.mount(source = uri,
                         mount_point = mountPoint,
                         extra_configs = configs)
    
    except Exception as e:
        if 'Directory already mounted' in str(e):
            pass
        else:
            raise e
    return mountPoint

def MountPath (containerName):
    storageName = GetStorageName()
    configs = AdlConfigs()
    print(storageName)
    return CreateMountPath (storageName, containerName, configs)

# COMMAND ----------

# MountPath('raw')
# dbutils.fs.ls('/mnt/raw/')
# dbutils.fs.mounts()
# dbutils.fs.unmount("/mnt/koushikTest")
# dbutils.fs.ls('/mnt/')

# COMMAND ----------

# MAGIC %md #SQL Connection

# COMMAND ----------

def RAISConnURL():
    jdbcHostname = GetSQLServer()
    jdbcDatabase = GetRAISDatabaseName()
    jdbcPort = 1433
    jdbcUrl = "jdbc:sqlserver://{0}:{1};database={2}".format(jdbcHostname, jdbcPort, jdbcDatabase)
    return jdbcUrl

def RAISConnProperties():
    connectionProperties = {
    "user" : GetDatabrickSqlUser(),
    "password" : GetDatabrickSqlPassword(),
    "driver" : "com.microsoft.sqlserver.jdbc.SQLServerDriver"
    }
    return connectionProperties