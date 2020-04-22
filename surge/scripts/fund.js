/*
Surge脚本: 从天天基金获取自选基金的估值涨幅
在safari地址栏输入 "input.fund/no?基金代码1&基金代码2" 可自定义自选基金代码，输入 "input.fund/no?null" 则默认使用脚本中写的自选基金代码。
下例的定时脚本，每周一到周五的14:40触发。

[Script]
fund.js = timeout=30,script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/fund.js,type=cron,cronexp=40 14 ? * 2-6
http-request ^http://input\.fund/no\?.+ script-path=https://raw.githubusercontent.com/7doi/conf/master/surge/scripts/fund.js
 */

// 默认自选基金代码
var no = ["008086", "161725", "007301", "519005", "519674", "003956", "001210", "004636", "161028", "003096", "005962", "005885", "005911", "320007"];
// 是否按照估值倒序排序
var sort = true
// 是否包含日期
var date = false
// 列表分隔符（不可以是单一的+、-、.、数字）
var seg = " - ";
// 基金代码的存储名字
var save_no = "fund_no_s"

if (typeof $request != "undefined") {
	let no_s = $request.url.split("?")[1];
	let b = $persistentStore.write(no_s, save_no);
	$notification.post("存储基金代码("+b+")", "变量名: "+save_no, "内容: "+no_s);
} else {
	no_read = $persistentStore.read(save_no);
	if (no_read != null && no_read.match(/[^0-9&]/) == null) {
		no = no_read.split("&");
	}
	const requestFunds = async () => {
		var a = [];
		for(j = 0; j < no.length; j++) {
			a.push(await requestFund(no[j]));
		};
		return a;
	}
	requestFunds().then(funds => {
		console.log("fund");
		if (sort) {
			funds = sorted(funds);
		};
		$notification.post("今日基金涨幅("+no.length+"支)", "估值涨幅"+seg+"基金全称"+seg+"更新时间", funds.join("\n"));
	});
}
$done();

function requestFund(n) {
	return new Promise(function (resolve, reject) {
		var url = "http://fund.eastmoney.com/" + n + ".html";
		$httpClient.get(url, function(error, response, data){
			if (response.status != 200) {
				resolve(n + seg + "获取失败！");
			} else {
				var gz = data.match(/(?:id="gz_gszzl">)(.+?%)/)[1];
				var gzname = data.match(/(?:class="funCur-FundName">)(.+?)(?=<\/span>)/)[1];
				var gztime = data.match(/(?:id="gz_gztime">)(.+?\))/)[1];
				if (! date) {
					gztime = gztime.split(" ")[1].slice(0,-1)
				}
				var all = gz + seg + gzname + seg + gztime;
				resolve(all);
			}
		})
	})
}

function sorted(funds) {
	var a = [];
	for(j = 0; j < funds.length; j++) {
		var b = funds[j];
		a.push([parseFloat(b.split(seg)[0]), b]);
	};
	a = a.sort(function(a,b){return b[0]-a[0]});
	for(j = 0; j < funds.length; j++) {
		a[j] = a[j][1];
	};
	return a;
}
