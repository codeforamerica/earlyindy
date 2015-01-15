require "selenium-webdriver"
require "pp"
require 'json'


driver = Selenium::WebDriver.for :firefox
driver.navigate.to "https://orm.naccrraware.net/orm/ormLogin.action?uid=SOXODVFVF6EL39Q"

username = driver.find_element(:id, 'username')
username.send_keys ARGV[0]

password = driver.find_element(:id, 'password')
password.send_keys ARGV[1]

login = driver.find_element(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "maskPageBtn", " " )) and (((count(preceding-sibling::*) + 1) = 1) and parent::*)]')
login.click

accept = driver.find_element(:id, 'disclaimerStatus')
accept.click

continue = driver.find_element(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "maskPageBtn", " " ))]')
continue.click

data = []

File.open("urls.txt", "r") do |url_file|
  url_file.each_line do |url|
    driver.navigate.to url
    school = {}
    school['ContactName'] = driver.find_element(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "subMenubar", " " ))]//tr[(((count(preceding-sibling::*) + 1) = 1) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['BusinessName'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 2) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    addressParts = /(.*?)(City)(.*?)(Zip).*?(\d+)/.match driver.find_element(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "subMenubar", " " ))]//tr[(((count(preceding-sibling::*) + 1) = 3) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['StreetAddress'] = addressParts[1]
    school['City'] = addressParts[3]
    school['Zip'] = addressParts[5]
    school['Phone'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 4) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    begin 
    	school['Email'] = driver.find_element(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]//a[(((count(preceding-sibling::*) + 1) = 1) and parent::*)]').text
	rescue
		school['Email'] = ''
	end
    begin 
    	school['Website'] = driver.find_element(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]//a[(((count(preceding-sibling::*) + 1) = 3) and parent::*)]').text 
	rescue
		school['Website'] = ''
	end
    
    types = /(.*?)Regulatory Type(.*?)\z/.match driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 6) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['TypeOfCare'] = types[1]
    school['Regulatory Type'] = types[2]
    school['Capacity'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 7) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text.slice! "Total Desired Capacity" 
    
    school['Ages'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 8) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text
    startTimes = driver.find_elements(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "careCell", " " )) and (((count(preceding-sibling::*) + 1) = 2) and parent::*)]//nobr').map! {|x| x.text}
    endTimes = driver.find_elements(:xpath, '//*[contains(concat( " ", @class, " " ), concat( " ", "careCell", " " )) and (((count(preceding-sibling::*) + 1) = 3) and parent::*)]//nobr').map! {|x| x.text}
    school['Hours'] = startTimes.zip endTimes
    school['PTQLevel'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 10) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['OnMyWay'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 11) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['Environment'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 13) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['CaregiverEducation'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 14) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['Training'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 15) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    school['FeeAssistance'] = driver.find_element(:xpath, '//tr[(((count(preceding-sibling::*) + 1) = 16) and parent::*)]//*[contains(concat( " ", @class, " " ), concat( " ", "resultsCell", " " ))]').text 
    data.push school

  end
end
out_file = File.new("schools.json", "w")
out_file.puts(JSON.generate(data))
out_file.close




