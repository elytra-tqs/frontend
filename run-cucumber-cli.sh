#!/bin/bash
cd ../stations-management
./mvnw test -Dtest=RunCucumberTest,CucumberIntegrationTest,CucumberTestRunner -DfailIfNoTests=false