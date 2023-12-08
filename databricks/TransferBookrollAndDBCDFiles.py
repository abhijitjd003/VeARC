# Databricks notebook source
# MAGIC %run /Shared/Common/CommonFunctions

# COMMAND ----------

import time #for date time
import pandas as pd #for panda library
import pyspark.sql.functions as F #for SQL funcations

# COMMAND ----------

mountPointRAW = MountPath('raw')

datePart =  time.strftime("%Y%m%d") # "%Y%m%d-%H%M%S" for time
bookrolllandingPath = mountPointRAW + '/Bookroll/landing/'
bookrollprocessedPath = mountPointRAW + '/Bookroll/landing/processed/'+datePart+'/'

dbcdlandingPath = mountPointRAW + '/DBCD/landing/'
dbcdprocessedPath = mountPointRAW + '/DBCD/landing/processed/'+datePart+'/'

# COMMAND ----------

bookrolllandingFolderList = dbutils.fs.ls(bookrolllandingPath)
bookrolllandingfileList = [F for F in bookrolllandingFolderList if not F.name.endswith('/')]
print("Number of files to move=",len(bookrolllandingfileList))

# COMMAND ----------

# Moving bookroll files from landing folder to processed folder
dbutils.fs.mkdirs(bookrollprocessedPath)
for f in bookrolllandingfileList:
    dbutils.fs.mv(f.path,bookrollprocessedPath)

# COMMAND ----------

dbcdlandingFolderList = dbutils.fs.ls(dbcdlandingPath)

dbcdlandingfileList = [F for F in dbcdlandingFolderList if not F.name.endswith('/')]
print("Number of files to move=",len(dbcdlandingfileList))

# COMMAND ----------

#Moving dbcd files from landing to processed folder
dbutils.fs.mkdirs(dbcdprocessedPath)
for f in dbcdlandingfileList:
    dbutils.fs.mv(f.path,dbcdprocessedPath)