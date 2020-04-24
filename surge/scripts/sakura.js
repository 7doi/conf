/*
Surge脚本: Sakura 签到
获取 Cookie 方式：登录 https://www.natfrp.com/，并点击 用户信息-确认激活（或者先手动签到一次）。

[Script]
http-request ^https://www\.natfrp\.com/\?.+?&csrf=.+ script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura.js
sakura-cookie = timeout=30,script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura.js,type=cron,cronexp=0 23 * * *
[MITM]
hostname = www.natfrp.com
 */

var title = "Sakura";
var site = "https://www.natfrp.com";
var seg = "@";
var save_name = title + ":cookie"+seg+"csrf";

if (typeof $request != "undefined") {
	let csrf = $request.url.match(/(?:&csrf=)([0-9a-zA-Z]+)/);
	if (csrf != null) {
		csrf=csrf[1];
		let cookie = $request.headers["Cookie"];
		let save = cookie + seg + csrf;
		let b = $persistentStore.write(save, save_name);
		$notification.post(title+"-Cookie("+b+")", "变量名: "+save_name, "内容: "+save);
	}
} else {
	cookie_csrf = $persistentStore.read(save_name).split(seg);
	var get_checkin = {
		url: site + "/?page=panel&module=sign&sign&csrf=" + cookie_csrf[1],
		headers: {"Cookie": cookie_csrf[0]}
	};
	$httpClient.get(get_checkin, function(error, response, data){
		$notification.post("签到: "+title, "", data);
	});
}
$done();
