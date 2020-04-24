/*
Surge脚本: Sakura 签到
获取 Cookie 方式：登录 https://www.natfrp.com/

[Script]
http-request ^https://www\.natfrp\.com/\?page=panel$ script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura3.js
http-response ^https://www\.natfrp\.com/\?page=panel$ requires-body=1, script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura3.js
sakura-cookie = timeout=30,script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura3.js,type=cron,cronexp=30 * * * *
[MITM]
hostname = www.natfrp.com
 */

var title = "Sakura";
var site = "https://www.natfrp.com";
var save_cookie = title + ":cookie";
var save_csrf = title + ":csrf";

if (typeof $response != "undefined") {
	let csrf = $response.body.match(/(?:&csrf=)([0-9a-zA-Z]+)/);
	if (csrf != null) {
		csrf=csrf[1];
		$persistentStore.write(csrf, save_csrf);
		cookie = $persistentStore.read(save_cookie);
		$notification.post(title+"-setCookie", "csrf: "+csrf, "cookie: "+cookie);
	}
} else if (typeof $request != "undefined") {
	let cookie = $request.headers["Cookie"];
	$persistentStore.write(cookie, save_cookie);
} else {
	cookie = $persistentStore.read(save_cookie);
	csrf = $persistentStore.read(save_csrf);
	var get_checkin = {
		url: site + "/?page=panel&module=sign&sign&csrf=" + csrf,
		headers: {"Cookie": cookie}
	};
	$httpClient.get(get_checkin, function(error, response, data){
		if (response.status != 200) {
			$notification.post("签到: "+title, "Cookie 失效！", "");
		} else if (data.match("剩余流量") != null) {
			$notification.post("签到: "+title, "", data);
		}
	});
}
$done({});
