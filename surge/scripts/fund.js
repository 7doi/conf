/*
Surge脚本: 从天天基金获取自选基金的估值涨幅
fund.js = timeout=30,script-path=fund.js,type=cron,cronexp=40 14 ? * 2-6
每周一到周五的14:40触发。
 */

// 自选基金代码
var no = ["008903", "008086", "161725", "007301", "001606", "519005", "519674", "005312", "003956", "001210", "004636", "161028", "003096", "005962", "002168", "005885", "005911", "320007"];
// 是否按照估值倒序排序
var sort = true
// 是否包含日期
var date = false
// 列表分隔符（不可以是单一的+、-、.、数字）
var seg = " - ";

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
	$done();
});

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
