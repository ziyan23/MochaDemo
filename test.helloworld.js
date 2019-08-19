var assert = require('assert')

var request = require('request')
const config = require('./config.json')

var utils = require("./utils.js");

const env = config.testing;
const url_bank = env.base_url + '/bank';

function get_body() {
	return {
	"payment_method": "SWIFT",
	"bank_country_code": "US",
	"account_name": "John Smith",
	"account_number": "123",
	"swift_code": "ICBCUSBJ",
	"aba": "11122233A"
	}
}

function get_body_AU() {
	return {
	"payment_method": "SWIFT",
	"bank_country_code": "AU",
	"account_name": "John Smith",
	"account_number": "1234567",
	"swift_code": "ICBCAUBJ",
	"bsb": "123456"
	}
}

function get_body_CN() {
	return {
	"payment_method": "LOCAL",
	"bank_country_code": "CN",
	"account_name": "John Smith",
	"account_number": "1234567",
	"swift_code": "ICBCCNBJ",
	"cbc": "123456"
	}
}


const RESPONSE_OK = 'Bank details saved';
const RESPONSE_PAYMENTMETHODERROR = '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\'';
const RESPONSE_COUNTRYCODE_ERROR = '\'bank_country_code\' is required, and should be one of \'US\', \'AU\', or \'CN\'';
const RESPONSE_NAME_LENGTH_ERROR  = 'Length of account_name should be between 2 and 10';
const RESPONSE_NAME_ERROR = '\'account_name\' is required';
const RESPONSE_NUMBER_ERROR = '\'account_number\' is required';
const RESPONSE_SWIFTCODE_LENGTH_ERROR = 'Length of \'swift_code\' should be either 8 or 11';
const RESPONSE_SWIFTCODE_ERROR = 'The swift code is not valid for the given bank country code: ';
const RESPONSE_SWIFTCODE_LOST_ERROR = '\'swift_code\' is required when payment method is \'SWIFT\'';

function get_number_error(min, max, country) {
	return 'Length of account_number should be between ' + min + ' and ' + max + ' when bank_country_code is ' + country;
}

function get_swiftcode(number, country) {
	return utils.random_string(4) + country + utils.random_string(number - 6);
}

function get_error(origincode, code, country) {
	if(origincode == '\'bsb\'' && country == '\'AU\'' ) {
		return 'Length of \'bsb\' should be 6';
	}else if(origincode == '\'aba\'' && country == '\'US\'' ) {
		return 'Length of \'aba\' should be 9';
	}
	return code + ' is required when bank country code is ' + country;
}


function api_bank(para_json, callback) {
	request({
		url: url_bank,
		method: 'POST',
		json: para_json
	}, function (err, response, body) {
		callback(err, response, body)
	});
}


describe('Bank', function(){

	describe('#payment_method', function () {
		//it
		it('payment method is LOCAL, should return 200', function(done){
			let body = get_body();
			body.payment_method = 'LOCAL';

			api_bank(body, function (err, res, body) {
				assert.equal(200, res.statusCode);
				assert.equal(RESPONSE_OK, body.success);
      			done();
			});
		});

		it('payment method is SWIFT, should return 200', function(done){
			let body = get_body();
			body.payment_method = 'SWIFT';

			api_bank(body, function (err, res, body) {
				assert.equal(200, res.statusCode);
				assert.equal(RESPONSE_OK, body.success);
      			done();
			});
		});

		it('payment_method is blank, should return 400', function(done){
			let body = get_body();
			body.payment_method = '';

			api_bank(body, function (err, res, body) {
				assert.equal(400, res.statusCode);
				assert.equal(RESPONSE_PAYMENTMETHODERROR,body.error);
      			done();
			});
		});
		it('payment_method is other, should return 400', function(done){
			let body = get_body();
			body.payment_method = utils.random_string(4);

			api_bank(body, function (err, res, body) {
				assert.equal(400, res.statusCode);
				assert.equal(RESPONSE_PAYMENTMETHODERROR,body.error);
      			done();
			});
		});
		it('payment_method is lost, should return 400', function(done){
			let body = get_body();
			delete body.payment_method;
			// console.log(body)
			api_bank(body, function (err, res, body) {
				assert.equal(400, res.statusCode);
				assert.equal(RESPONSE_PAYMENTMETHODERROR,body.error);
      			done();
			});
		});

		//end it
	});

	describe('bank_country_code', function () {
		it('bank_country_code = US，payment_method = SWIFT,return 200', function (done) {
			let body = get_body();
			body.bank_country_code = 'US';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code = AU，payment_method = SWIFT,return 200', function (done) {
			let body = get_body_AU();
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code = CN，payment_method = LOCAL,return 200', function (done) {
			let body = get_body_CN();
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code is lower-case,return 400', function (done) {
			let body = get_body_CN();
			body.bank_country_code = 'cn';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_COUNTRYCODE_ERROR,body.error);
				done();
			});
			
		})
		it('bank_country_code is others,return 400', function (done) {
			let body = get_body_CN();
			body.bank_country_code = 'xx';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_COUNTRYCODE_ERROR,body.error);
				done();
			});
			
		})
		it('bank_country_code is blank,return 400', function (done) {
			let body = get_body_CN();
			body.bank_country_code = '';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_COUNTRYCODE_ERROR,body.error);
				done();
			});
			
		})
		it('bank_country_code is lost,return 400', function (done) {
			let body = get_body_CN();
			delete body.bank_country_code;
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_COUNTRYCODE_ERROR,body.error);
				done();
			});
			
		})				
	})

	describe('account_name', function () {
		it('account name length = 2 ,return 200', function (done) {
			let body = get_body();
			body.account_name = '中文';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('length of account name = 10 ,return 200', function (done) {
			let body = get_body();
			body.account_name = utils.random_string(10);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});	
		})
		it('account_name has space ,return 200', function (done) {
			let body = get_body();
			body.account_name = utils.random_string(2) + ' ' + utils.random_string(2) ;
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('account_name has special char ,return 200', function (done) {
			let body = get_body();
			body.account_name = '@#$%&**(';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('length of account name = 1,return 400', function (done) {
			let body = get_body();
			body.account_name = 'a';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_NAME_LENGTH_ERROR,body.error);
				done();
			});
			
		})
		it('length of account name = 11,return 400', function (done) {
			let body = get_body();
			body.account_name = utils.random_string(11);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_NAME_LENGTH_ERROR,body.error);
				done();
			});
			
		})
		it('account name is blank,return 400', function (done) {
			let body = get_body();
			body.account_name = '';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_NAME_ERROR,body.error);
				done();
			});
			
		})
		it('account name is lost,return 400', function (done) {
			let body = get_body();
			body.account_name = '';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_NAME_ERROR,body.error);
				done();
			});
			
		})				
	})

	describe('account_number', function () {
		it('bank_country_code = US,length of account_number = 1,return 200', function (done) {
			let body = get_body();
			body.account_number = utils.random_string(1);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code = US,length of account_number = 1 and has blank,return 200', function (done) {
			let body = get_body();
			body.account_number = utils.random_string(1) + ' '+ utils.random_string(15);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code = AU,length of account_number = 6 and has chinese,return 200', function (done) {
			let body = get_body_AU();
			body.account_number = '中文一二三四';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})	
		it('bank_country_code = AU,length of account_number = 9 and has special char,return 200', function (done) {
			let body = get_body_AU();
			body.account_number = '!@$%^&*()';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})	
		it('bank_country_code = CN,length of account_number = 8,return 200', function (done) {
			let body = get_body_CN();
			body.account_number = utils.random_string(8);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code = CN,length of account_number = 20,return 200', function (done) {
			let body = get_body_CN();
			body.account_number = utils.random_string(20);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code = US,length of account_number = 0,return 400', function (done) {
			let body = get_body();
			body.account_number = utils.random_string(0);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_NUMBER_ERROR,body.error);
				done();
			});
			
		})
		it('bank_country_code = US,length of account_number = 18,return 400', function (done) {
			let body = get_body();
			body.account_number = utils.random_string(18);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_number_error(1,17,'\'US\''),body.error);
				done();
			});
			
		})
		it('bank_country_code = AU,length of account_number = 5,return 400', function (done) {
			let body = get_body_AU();
			body.account_number = utils.random_string(5);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_number_error(6,9,'\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code = AU,length of account_number = 10,return 400', function (done) {
			let body = get_body_AU();
			body.account_number = utils.random_string(10);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_number_error(6,9,'\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code = CN,length of account_number = 7,return 400', function (done) {
			let body = get_body_AU();
			body.account_number = utils.random_string(7);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_number_error(8,20,'\'CN\''),body.error);
				done();
			});
			
		})
		it('bank_country_code = CN,length of account_number = 21,return 400', function (done) {
			let body = get_body_AU();
			body.account_number = utils.random_string(21);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_number_error(8,20,'\'CN\''),body.error);
				done();
			});
			
		})
		it('bank_country_code = US,account_number is lost,return 400', function (done) {
			let body = get_body();
			delete body.account_number;
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_NUMBER_ERROR,body.error);
				done();
			});
			
		})

	})

	describe('swift_code', function () {
		it('payment method = LOCAL,swift_code is right,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'LOCAL';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = LOCAL,swift_code is blank,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'LOCAL';
			body.swift_code = '';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = LOCAL,swift_code is wrong,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'LOCAL';
			body.swift_code = 'ICBCCNBJ';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = LOCAL,swift_code is lost,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'LOCAL';
			delete body.swift_code;
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=US,length of swift_code = 8,rule is right,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(8,'US');
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=US,length of swift_code = 11,rule is right,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(11,'US');
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=AU,length of swift_code = 8 ,rule is right,return 200', function (done) {
			let body = get_body_AU();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(8,'AU');
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=AU,length of swift_code = 11 and has chinese ,rule is right,return 200', function (done) {
			let body = get_body_AU();
			body.payment_method = 'SWIFT';
			body.swift_code = '中文三四AU 1234';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,length of swift_code = 8 and has special char ,rule is right,return 200', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.swift_code = '<>,.CNd\'';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,length of swift_code = 11 ,rule is right,return 200', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(11,'CN');
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=US,length of swift_code = 7 ,rule is right,return 400', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(7,'US');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_LENGTH_ERROR,body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=US,length of swift_code = 9 ,rule is right,return 400', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(9,'US');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_LENGTH_ERROR,body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=AU,length of swift_code = 10 ,rule is right,return 400', function (done) {
			let body = get_body_AU();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(10,'AU');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_LENGTH_ERROR,body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,length of swift_code = 12 ,rule is right,return 400', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(12,'CN');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_LENGTH_ERROR,body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=US,length of swift_code = 8 ,rule is wrong,return 400', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(8,'AU');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_ERROR + 'US',body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=US,length of swift_code = 11 ,rule is wrong,return 400', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.swift_code = utils.random_string(11);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_ERROR + 'US',body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=AU,length of swift_code = 8 ,rule is wrong,return 400', function (done) {
			let body = get_body_AU();
			body.payment_method = 'SWIFT';
			body.swift_code = utils.random_string(8);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_ERROR + 'AU',body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=AU,length of swift_code = 11 ,rule is wrong,return 400', function (done) {
			let body = get_body_AU();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(11,'CN');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_ERROR + 'AU',body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,length of swift_code = 8 ,rule is wrong,return 400', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.swift_code = get_swiftcode(8,'US');
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_ERROR + 'CN',body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,length of swift_code = 11 ,rule is wrong,return 400', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.swift_code = utils.random_string(11);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_ERROR + 'CN',body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,swift_code is blank ,return 400', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.swift_code = '';
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_LOST_ERROR,body.error);
				done();
			});
			
		})
		it('payment method = SWIFT，bank_country_code=CN,swift_code is lost ,return 400', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			delete body.swift_code;
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(RESPONSE_SWIFTCODE_LOST_ERROR,body.error);
				done();
			});
			
		})
	})

	describe('bsb/aba', function () {
		it('bank_country_code=AU，key = bsb,length = 6,return 200', function (done) {
			let body = get_body_AU();
			body.payment_method = 'LOCAL';
			body.bsb = utils.random_string(6);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code=AU，key = bsb,length = 6 and the value of bsb has special char,return 200', function (done) {
			let body = get_body_AU();
			body.payment_method = 'SWIFT';
			body.bsb = '@#()*&';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code=US，key = aba,length = 9 and the value of aba has blank and chinese,return 200', function (done) {
			let body = get_body();
			body.payment_method = 'SWIFT';
			body.aba = utils.random_string(6) + ' 中文';
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code=CN,key = cbc,length = 6,return 200', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			body.cbc = utils.random_string(6);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code=CN,key = bsb,length = 6,return 200', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			delete body.cbc;
			body.bsb = utils.random_string(6);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code=CN,key = aba,length = 9,return 200', function (done) {
			let body = get_body_CN();
			body.payment_method = 'SWIFT';
			delete body.cbc;
			body.aba = utils.random_string(9);
			api_bank(body,function(err,res,body) {
				assert.equal(200,res.statusCode);
				assert.equal(RESPONSE_OK,body.success);
				done();
			});
			
		})
		it('bank_country_code=AU,key = aba,length = 9,return 400', function (done) {
			let body = get_body_AU();
			delete body.bsb;
			body.aba = utils.random_string(9);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'aba\'','\'bsb\'','\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=AU,key = cbc,length = 9,return 400', function (done) {
			let body = get_body_AU();
			delete body.bsb;
			body.cbc = utils.random_string(9);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'cbc\'','\'bsb\'','\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=AU,key = bsb,length = 7,return 400', function (done) {
			let body = get_body_AU();
			body.bsb = utils.random_string(7);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'bsb\'','\'bsb\'','\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=AU,key = bsb,length = 5,return 400', function (done) {
			let body = get_body_AU();
			body.bsb = utils.random_string(5);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'bsb\'','\'bsb\'','\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=AU,bsb is lost,return 400', function (done) {
			let body = get_body_AU();
			delete body.bsb;
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('','\'bsb\'','\'AU\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=US,key = bsb,length = 6,return 400', function (done) {
			let body = get_body();
			delete body.aba;
			body.bsb = utils.random_string(6);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'bsb\'','\'aba\'','\'US\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=US,key = cbc,length = 6,return 400', function (done) {
			let body = get_body();
			delete body.aba;
			body.cbc = utils.random_string(6);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'cbc\'','\'aba\'','\'US\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=US,key = aba,length = 8,return 400', function (done) {
			let body = get_body();
			body.aba = utils.random_string(8);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'aba\'','\'aba\'','\'US\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=US,key = aba,length = 10,return 400', function (done) {
			let body = get_body();
			body.aba = utils.random_string(10);
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('\'aba\'','\'aba\'','\'US\''),body.error);
				done();
			});
			
		})
		it('bank_country_code=US,aba is lost,return 400', function (done) {
			let body = get_body_AU();
			delete body.aba;
			api_bank(body,function(err,res,body) {
				assert.equal(400,res.statusCode);
				assert.equal(get_error('','\'aba\'','\'US\''),body.error);
				done();
			});
			
		})
	})

});