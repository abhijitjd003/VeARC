# Databricks notebook source
# MAGIC %run /Shared/Common/CommonFunctions

# COMMAND ----------

# DBTITLE 1,Import Libraries
import re #for regular expression
import pandas as pd #for panda library
import pyspark.sql.functions as F #for SQL funcations
import time #for date time
import multiprocessing.pool as Pool
import multiprocessing

# COMMAND ----------

mountPointRAW = MountPath('raw')

landingPath = mountPointRAW + '/Bookroll/landing/'

# fileList = dbutils.fs.ls(mountPointRAW)
datePart =  time.strftime("%Y%m%d") # "%Y%m%d-%H%M%S" for time
processedPath = mountPointRAW + '/Bookroll/landing/processed/'+datePart+'/'

# COMMAND ----------

landingFolderList = dbutils.fs.ls(landingPath)

landingfileList = [F for F in landingFolderList if not F.name.endswith('/')]
# fileList

# COMMAND ----------

groupdf = spark.read.jdbc(url=RAISConnURL(), table="dbo.A3Group", properties=RAISConnProperties())
groupdf.createOrReplaceGlobalTempView("A3Group")

Spdf = spark.read.jdbc(url=RAISConnURL(), table="dbo.A3Element", properties=RAISConnProperties())
Spdf.createOrReplaceGlobalTempView("A3Element")

groupTagsX=groupdf.filter(groupdf.IsBookroll==1).select(groupdf.GrpType).toPandas()['GrpType']
groupTags=list(groupTagsX)

# COMMAND ----------

# def NumberOfThreadsToProcess(listToProcess):
#     lisLen = len(listToProcess)
#     if lisLen < multiprocessing.cpu_count():
#         return listLen
#     else:
#         return multiprocessing.cpu_count()

# COMMAND ----------

jdbcURL = """jdbc:sqlserver://"""+GetSQLServer()+""":1433
            ;database="""+GetRAISDatabaseName()+"""
            ;user="""+GetDatabrickSqlUser()+"""
            ;password="""+GetDatabrickSqlPassword()+"""
            ;encrypt=true
            ;trustServerCertificate=false
            ;hostNameInCertificate=*.database.windows.net"""

# COMMAND ----------

import concurrent.futures

def runNotebook(args):
    notebookPath, targetGrp, jdbcURL = args
    runState = dbutils.notebook.run(notebookPath, timeout_seconds=10800, arguments={"TargetGrpTypeParam": targetGrp, "jdbcURLParam": jdbcURL})
    return runState

notebookPath = "/Shared/Bookroll/LoadBookrollTable" 
jdbcURL = jdbcURL
groupTags = groupTags # List of group tags

args_list = [(notebookPath, targetGrp, jdbcURL) for targetGrp in groupTags]

with concurrent.futures.ThreadPoolExecutor() as executor:
    results = executor.map(runNotebook, args_list)
    # for result in results:
    #     # Process the results as needed
    #     print(result)


# COMMAND ----------

loadCUCompany = "EXEC dbo.udp_Load_CU_Company"
loadCUCustomer = "EXEC dbo.udp_Load_CU_CustomerInfo"
delDuplicateRows = "EXEC dbo.udp_DeleteDuplicateRows"
driver_manager = spark._sc._gateway.jvm.java.sql.DriverManager
con = driver_manager.getConnection(RAISConnURL(), GetDatabrickSqlUser(), GetDatabrickSqlPassword())

# Create callable statement and execute it
exec_LoadCUCompanystatement = con.prepareCall(loadCUCompany)
exec_LoadCUCompanystatement.execute()

exec_LoadCUCustomer = con.prepareCall(loadCUCustomer)
exec_LoadCUCustomer.execute()

exec_DelDuplicateRows = con.prepareCall(delDuplicateRows)
exec_DelDuplicateRows.execute()

# Close connections
exec_LoadCUCompanystatement.close()
exec_LoadCUCustomer.close()
exec_DelDuplicateRows.close()
con.close()

# COMMAND ----------

# MAGIC  %run "/Shared/DBCD/Extract _DBCD_Master"