// 根据不同的网络情况决定是使用doh，还是使用路由器提供的dns

var hostname = $domain;
// 这些网络下不使用默认doh
var ssids = [
    'zzzzzzzzz', 
];
// 存在这些dns不使用默认doh
var dnss = [
];
// 出现以下域名 后缀、域名、ip 则不使用默认doh
var domain_suffix = [
];
var domain = [
]
var ip = [
]

// ssids
ssids = '^(' + ssids.join('|') + ')$'
ssids = new RegExp(ssids)
// dnss
dnss = '"(' + dnss.join('|') + ')"'
dnss = new RegExp(dnss)
var ssid = $network.wifi.ssid;
if (ssid === null) {
    ssid = ''  // 有线网
}
var ssidMatched = ! ssid.match(ssids);
var dnsMatched = ! JSON.stringify($network.dns).match(dnss)
if (ssidMatched && dnsMatched) {
    // domain_suffix
    for(j = 0; j < domain_suffix.length; j++) {
        domain_suffix[j] = domain_suffix[j].replace(/\./g, '\\.');
    };
    domain_suffix = '(^|\\.)(' + domain_suffix.join('|') + ')$'
    domain_suffix = new RegExp(domain_suffix)
    // domain
    domain = '^(' + domain.join('|') + ')$'
    domain = new RegExp(domain)
    // ip
    ip = '^[.0-9]*(' + ip.join('|') + ')[.0-9]*$'
    ip = new RegExp(ip)
    var hostnameMatched = hostname.match(domain) || hostname.match(domain_suffix) || hostname.match(ip)
    if (hostnameMatched) {
        $done({servers:$network.dns})
    } else {
        $done({})
    }
} else {
    $done({servers:$network.dns})
}
