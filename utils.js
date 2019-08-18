exports.random_string = function (len) {
	var ret           = '';
	var str_set       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var set_len = str_set.length;
	for ( var i = 0; i < len; i++ ) {
		ret += str_set.charAt(Math.floor(Math.random() * set_len));
	}
	return ret;
}
