// Created by Dan Mitu - CS361 - Spring '18
// SOURCE FOR CAST: https://www.bennadel.com/blog/3188-casting-bit-fields-to-booleans-using-the-node-js-mysql-driver.htm

var mysql = require('mysql');

var pool = mysql.createPool({
	host: 'classmysql.engr.oregonstate.edu',
	user: 'cs361_mitud',
	password: '1833',
	multipleStatements: true,
	database: 'cs361_mitud',
	dateStrings: 'date',
	typeCast: function castField( field, useDefaultTypeCasting ) {
		if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
			var bytes = field.buffer();
			return( bytes[ 0 ] === 1 );
        }
        return( useDefaultTypeCasting() );
    }
});

module.exports.pool = pool;
