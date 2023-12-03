# Databricks notebook source
# MAGIC %run /Shared/Common/CommonFunctions

# COMMAND ----------

TargetGrpType = dbutils.widgets.get("TargetGrpTypeParam")

writeMode = "append"
overwriteTablesList = ['110','260','280','540','1900']
if TargetGrpType in overwriteTablesList:
    writeMode = "overwrite"

jdbcURL = dbutils.widgets.get("jdbcURLParam")
# fileList = dbutils.widgets.get("fileListParam")

# COMMAND ----------

# DBTITLE 1,Import Libraries
import re #for regular expression
import pandas as pd #for panda library
import pyspark.sql.functions as F #for SQL funcations
import time #for date time

# COMMAND ----------

mountPointRAW = MountPath('raw')

# COMMAND ----------

groupName = spark.sql("""
SELECT REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(Name, ' ', ''),'(',''),')',''),'-',''),'/',''),'''',''),'Group','')
FROM  global_temp.A3Group WHERE GrpType = """+str(TargetGrpType)+"""
""").collect()[0][0]

groupTag = spark.sql("""SELECT Desig FROM global_temp.A3Group
WHERE GrpType = """+str(TargetGrpType)+"""
""").collect()[0][0]

# COMMAND ----------



# COMMAND ----------

# MAGIC %md #Reading Files

# COMMAND ----------

landingPath = mountPointRAW + '/Bookroll/landing/'

landingFolderList = dbutils.fs.ls(landingPath)

fileList = [F for F in landingFolderList if not F.name.endswith('/')]
# fileList


# fileList = dbutils.fs.ls(mountPointRAW)

# COMMAND ----------

# MAGIC %md #Set Target Variables

# COMMAND ----------

TargetHeaderPattern1 = r"\?"+groupTag
TargetHeaderPattern2 = r" "+groupTag

# databaseDest = "stage"
tableDest = groupName

# COMMAND ----------

# MAGIC %md #Creating dynamic DF

# COMMAND ----------

Spdf = spark.sql("""
                 SELECT * FROM global_temp.a3element
                 """)

# COMMAND ----------

pd.set_option("display.max_colwidth", 10000000)
# query = """
# SELECT concat_ws(',',collect_list(ColumnName)) as columnList FROM Policyele
# WHERE GrpType = """+str(TargetGrpType)+"""
# AND IsValColumn = 1
# """
createDFQuery = """
SELECT concat_ws(',',collect_list(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(Descr, ' ', ''),'(',''),')',''),'-',''),'/','')
    )) as ColumnNames
FROM global_temp.A3Element
WHERE grptype =  """+str(TargetGrpType)+"""
"""

columnListDF = spark.sql(createDFQuery)
columnListDFP = columnListDF.toPandas()
columnListStr = columnListDFP['ColumnNames'].to_string()


custColumnListStr = 'ADBID,FileName,PolID,'+columnListStr[5:]

# COMMAND ----------

from io import StringIO
columnListString = custColumnListStr
string= StringIO(columnListString)
mainDF=pd.read_csv(string, sep=",")

# COMMAND ----------

# MAGIC %md #Dynamic Insert Script

# COMMAND ----------

# del dynamicPolDF
dynamicDF = Spdf.select(
            # 'GrpType'
            # ,'Len'
            # ,'Offset'
            # ,
            F.lit(1).alias('id')
            ,F.concat(F.lit('fileText[pos+'),'Offset',F.lit(': pos+'),'Offset',F.lit('+'),'Len',F.lit('].strip()')).alias('DynamicQuery')
            ).filter((F.col('GrpType')==TargetGrpType) #& (F.col('IsValColumn') ==1)
                    )

# COMMAND ----------

dynamicDF.createOrReplaceTempView('dynamicData')

query = """
select concat_ws(',',collect_list(DynamicQuery)) as ExtractionConfigQuery from dynamicData 
group by id
"""

extractionConfigDF = spark.sql(query)
PextractionConfigDF = extractionConfigDF.toPandas()
extractionConfigString = PextractionConfigDF['ExtractionConfigQuery'].to_string()

# COMMAND ----------

extractionConfigStringN = extractionConfigString[5:]
for f in fileList : #for all the files
    pi = 0
      
    fileText =''
    try :
        fileData = spark.read.text(f.path)
        pfiledata = fileData.toPandas()
        fileText = pfiledata.to_string()

         #find the index of policy header
        #hardcoded for policy to get policynumber details for all the tables
        
        polInfoIndex_obj1 = re.finditer(r"\?5BPI",fileText)
        polInfoIndex1 = [i.start() for i in polInfoIndex_obj1]

        polInfoIndex_obj2 = re.finditer(r"\ 5BPI",fileText)
        polInfoIndex2 = [i.start() for i in polInfoIndex_obj2]

        polInfoIndex = polInfoIndex1 + polInfoIndex2
        # polInfoIndex
        # end of policy no extration index

        #to get the position of required pattern
        InfoIndex_obj1 = re.finditer(TargetHeaderPattern1,fileText)
        InfoIndex1 = [i.start() for i in InfoIndex_obj1]

        InfoIndex_obj2 = re.finditer(TargetHeaderPattern2,fileText)
        InfoIndex2 = [i.start() for i in InfoIndex_obj2]

        InfoIndex = InfoIndex1 + InfoIndex2

        if len(InfoIndex) > 0 :
            for i in InfoIndex: #for every occurance of pattern
                # CustextractionConfigStringN ="'"+f.name+"',fileText[polInfoIndex["+str(pi)+"]+1+30: polInfoIndex["+str(pi)+"]+1+30+25].strip()+'_'+fileText[polInfoIndex["+str(pi)+"]+1+257: polInfoIndex["+str(pi)+"]+1+257+8].strip()+'_'+fileText[polInfoIndex["+str(pi)+"]+1+265: polInfoIndex["+str(pi)+"]+1+265+8].strip(),"+extractionConfigStringN

                CustextractionConfigStringN ="'"+f.name[:f.name.find('_')]+"',"+"'"+f.name[f.name.find('_')+1:]+"',fileText[polInfoIndex["+str(pi)+"]+1+30: polInfoIndex["+str(pi)+"]+1+30+25].strip()+'-'+fileText[polInfoIndex["+str(pi)+"]+1+257: polInfoIndex["+str(pi)+"]+1+257+8].strip()+'-'+fileText[polInfoIndex["+str(pi)+"]+1+265: polInfoIndex["+str(pi)+"]+1+265+8].strip(),"+extractionConfigStringN
                
                pos = i+1
                mainDF.loc[len(mainDF)] =(eval(CustextractionConfigStringN))
                pi = pi+1
        else :
            pass
        # dbutils.fs.mv(f.path,processedFilePath+f.name)
    except Exception as e:
        # dbutils.fs.mv(f.path,failedFilePath+f.name)  
        # print(f.name)
        pass  

# COMMAND ----------

# text = "A1020390AIP_0c932f7f-4cfb-4e40-be08-b846ec5f8948.dat"

# text[:text.find('_')]
# text[text.find('_')+1:]

# COMMAND ----------

# MAGIC %md #Write To AZURE SQL

# COMMAND ----------

if len(mainDF) > 0:
    sparkDF = spark.createDataFrame(mainDF)

    sparkDF.write\
    .format("jdbc")\
    .mode(writeMode)\
    .option("url",jdbcURL)\
    .option("user",GetDatabrickSqlUser())\
    .option("password",GetDatabrickSqlPassword())\
    .option("dbtable",tableDest)\
    .option("batchsize",50000)\
    .option("tableLock",True)\
    .save()

# else:
#     print("no file to process")

# COMMAND ----------

del(mainDF)