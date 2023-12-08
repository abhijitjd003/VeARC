# Databricks notebook source
# MAGIC %md #KeyVault Connection

# COMMAND ----------

def GetSecret(secretName):
    secretValue = dbutils.secrets.get(scope = 'rais-prod-key-vault-secret', key = secretName)
    return secretValue

# COMMAND ----------

# MAGIC %md #Get secrets from KeyVault

# COMMAND ----------

def GetTenantId():
    return GetSecret('TenantID')

def GetStorageClientId():
    return GetSecret('StorageClientId')

def GetStorageClientSecret():
    return GetSecret('StorageClientSecret')

def GetStorageName():
    return GetSecret('StorageName')


# COMMAND ----------

def GetSQLServer():
    return GetSecret('SQLServer')

def GetDatabrickSqlUser():
    return GetSecret('SqlDatabrickUser')

def GetDatabrickSqlPassword():
    return GetSecret('SqlDatabrickUserPass')

def GetRAISDatabaseName():
    return GetSecret('RAISDatabase')

# COMMAND ----------

def GetAPIBaseUrl():
    return GetSecret('APIBaseUrl')

def GetAPIUsername():
    return GetSecret('APIUsername')

def GetAPIPassword():
    return GetSecret('APIPassword')