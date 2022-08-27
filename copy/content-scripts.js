var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var options = {};
function clearDisable() {
    // 移除百度文库的广告
    if (window.location.href.includes('baidu')) {
        document.querySelectorAll('.hx-warp').forEach(function (ad) { return ad.style.display = 'none'; });
        document.querySelectorAll('.hx-recom-wrapper').forEach(function (ad) { return ad.style.display = 'none'; });
    }
    // 移除code、pre userSelect为none
    var setUserSelect = function (node) { return window.getComputedStyle(node).userSelect === 'none' && (node.style.userSelect = 'auto'); };
    document.querySelectorAll('code').forEach(setUserSelect);
    document.querySelectorAll('pre').forEach(setUserSelect);
    document.querySelectorAll('code div[data-title="登录后复制"]').forEach(function (node) { return node.style.display = 'none'; });
}
// function showHide () {
//   if(!window.location.hostname?.includes('csdn')) return
//   const content = document.querySelector('.article_content')
//   if(content){
//     content.style.height = 'unset'
//   }
//   // 移除底部讨厌的关注后阅读
//   const hideBox = document.querySelector('.hide-article-box')
//   if(hideBox){
//     hideBox.style.display = 'none'
//   }
// }
window.onload = function () { return __awaiter(_this, void 0, void 0, function () {
    var proxy, inject;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                proxy = new Proxy(options, {
                    set: function (target, propKey, value, receiver) {
                        if (propKey === 'clear-disabled' && value.enable) {
                            clearDisable();
                        }
                        return Reflect.set(target, propKey, value, receiver);
                    }
                });
                //数据初始化
                return [4 /*yield*/, Promise.all(['clear-disabled', 'clear-text']
                        .map(function (key) { return new Promise(function (r) {
                        // @ts-ignore next-line
                        chrome.storage.sync.get(key, function (data) {
                            proxy[key] = data[key];
                            r(null);
                        });
                    }); }))
                    // 同步更新options数据
                    // @ts-ignore next-line
                ];
            case 1:
                //数据初始化
                _a.sent();
                // 同步更新options数据
                // @ts-ignore next-line
                chrome.storage.onChanged.addListener(function (changes) {
                    for (var _i = 0, _a = Object.entries(changes); _i < _a.length; _i++) {
                        var _b = _a[_i], key = _b[0], _c = _b[1], oldValue = _c.oldValue, newValue = _c.newValue;
                        proxy[key] = newValue;
                    }
                });
                // 功能一： remove extra text
                document.addEventListener('copy', function (event) {
                    var _a;
                    if ((_a = options['clear-text']) === null || _a === void 0 ? void 0 : _a.enable) {
                        event.clipboardData.setData('text', document.getSelection());
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                    }
                }, true);
                // 功能二： 解除复制禁用
                // 百度文库等添加ctrl+c监听事件阻止复制
                window.addEventListener('keydown', function (event) {
                    var _a;
                    if ((_a = options['clear-disabled']) === null || _a === void 0 ? void 0 : _a.enable) {
                        event.stopImmediatePropagation();
                    }
                }, true);
                // 飞书等添加 copy 监听事件阻止复制
                window.addEventListener('copy', function (event) {
                    var _a, _b;
                    // copy事件已经在clearTextFormat里面处理了，当clearTextFormat为false才需要做处理。
                    if (((_a = options['clear-disabled']) === null || _a === void 0 ? void 0 : _a.enable) && !((_b = options['clear-text']) === null || _b === void 0 ? void 0 : _b.enable)) {
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                    }
                }, true);
                inject = function () {
                    return new Promise(function (resolve) {
                        var script = document.createElement("script");
                        script.setAttribute('type', 'text/javascript');
                        // @ts-ignore next-line
                        script.setAttribute('src', chrome.runtime.getURL("page-script.js"));
                        script.onload = function () {
                            /*
                              * Using document.dispatchEvent instead window.postMessage by security reason
                              * https://github.com/w3c/webextensions/issues/78#issuecomment-915272953
                              */
                            // document.dispatchEvent(new CustomEvent('message', { detail: scripts }))
                            document.head.removeChild(script);
                            resolve(null);
                        };
                        document.head.appendChild(script);
                    });
                };
                inject().then(function () {
                    // @ts-ignore next-line
                    chrome.runtime.sendMessage("runEnableScripts");
                });
                return [2 /*return*/];
        }
    });
}); };
// 收集报错信息，作为页面和插件的通信工具。
window.addEventListener('message', function (event) {
    var data = event.data;
    if (data.type === 'extension_error') {
        // @ts-ignore next-line
        chrome.runtime.sendMessage(data);
    }
});
