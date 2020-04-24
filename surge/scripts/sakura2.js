/*
Surge脚本: Sakura 签到
获取 Cookie 方式：登录 https://www.natfrp.com/

[Script]
http-request ^https://www\.natfrp\.com/\?page=panel$ script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura2.js
sakura-cookie = timeout=30,script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/sakura2.js,type=cron,cronexp=0 20 * * *
[MITM]
hostname = www.natfrp.com
 */

var title = "Sakura";
var site = "https://www.natfrp.com";
var save_cookie = title + ":cookie";

if (typeof $request != "undefined") {
	let cookie = $request.headers["Cookie"];
	cookie = cookie.match(/(_ga|_gid)=[^;]+?;/g).join(" ");
	let b = $persistentStore.write(cookie, save_cookie);
	$notification.post(title+"-get Cookie", "写入: "+b, "Cookie: "+cookie);
} else {
	let cookie = $persistentStore.read(save_cookie);
	let get_cookie = {
		url: site + "/?page=panel",
		headers: {"Cookie": cookie}
	};
	$httpClient.post(get_cookie, function(error, response, data){
		if (response.status != 200) {
			$notification.post(title+"-get_cookie", "Cookie 错误！", "");
		} else {
			cookie = cookie + response.headers["Set-Cookie"].match(/(acw_tc|PHPSESSID)=[^;]+?;/g).join(" ");
			let get_csrf = {
				url: site + "/?page=panel",
				headers: {"Cookie": cookie}
			};
			$httpClient.get(get_csrf, function(error, response, data){
				if (response.status != 200) {
					$notification.post(title+"-get_csrf", "Cookie 错误！", "");
				} else {
					let csrf = data.match(/(?:&csrf=)([0-9a-zA-Z]+)/)[1];
					let get_checkin = {
						url: site + "/?page=panel&module=sign&sign&csrf=" + csrf,
						headers: {"Cookie": cookie}
					};
					$httpClient.get(get_checkin, function(error, response, data){
						$notification.post("签到: "+title, "", data);
					});
				}
			});
		}
	});
}
$done({});
