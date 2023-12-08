# Databricks notebook source
# MAGIC %run /Shared/Common/KeyVaultConfig

# COMMAND ----------

import requests
import json

base_url = GetAPIBaseUrl()


# COMMAND ----------

def getBearerToken():
    payload='username={0}&password={1}&grant_type=password'.format(GetAPIUsername(), GetAPIPassword())
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    url = base_url + "/token"
    response = requests.request("POST", url, headers=headers, data=payload)

    bearerToken = json.loads(response.text)
    token =  bearerToken["access_token"]    
    return token

# COMMAND ----------

def executeIvansRdmSync():
    payload={}
    headers = {'Authorization': 'bearer ' + getBearerToken()}
    url = base_url + "/api/v1/Ivans/RdmSync"
    response = requests.request("GET", url, headers=headers, data=payload)
    print("RDM Sync Status: " + response.text)

# COMMAND ----------

executeIvansRdmSync()

# COMMAND ----------

# MAGIC %run "/Shared/MoveFiles/TransferBookrollAndDBCDFiles"