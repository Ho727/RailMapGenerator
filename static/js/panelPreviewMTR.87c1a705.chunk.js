(this["webpackJsonprail-map-generator"]=this["webpackJsonprail-map-generator"]||[]).push([[59],{89:function(e,t,n){"use strict";n.r(t),n.d(t,"getBase64FontFace",(function(){return f}));var r=n(56),o=n.n(r),c=n(8),u=n(57),a=function(){var e=Object(u.a)(o.a.mark((function e(t,n){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",document.fonts.load("80px Noto Serif "+n,t).then((function(e){return Object(c.a)(Object(c.a)(document.querySelectorAll("style")).filter((function(e){return"googlefonts"===e.id}))[0].sheet.cssRules).filter((function(e){return e.cssText.includes("Noto Serif "+n)})).filter((function(t){return t.cssText.includes(e[0].unicodeRange)}))[0].cssText})));case 1:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),i=function(){var e=Object(u.a)(o.a.mark((function e(t){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("\u95e8"!==t){e.next=2;break}return e.abrupt("return",Promise.all([a(t,"SC")]));case 2:return e.abrupt("return",Promise.all([a(t,"KR")]).catch((function(){return Promise.all([a(t,"JP")]).catch((function(){return Promise.all([a(t,"TC"),a(t,"SC")]).catch((function(){return Promise.all([a(t,"SC")]).catch((function(){return console.warn(t+": not found"),[]}))}))}))})));case 3:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),s=function(e){return new Promise((function(t){var n=new FileReader;n.onloadend=function(){return t(n.result)},n.readAsDataURL(e)}))},f=function(e){return fetch("https://fonts.googleapis.com/css?family=Noto+Serif+KR:600|Noto+Serif+JP:600|Noto+Serif+TC:600|Noto+Serif+SC:600%26display=swap").then((function(e){return e.text()})).then(function(){var t=Object(u.a)(o.a.mark((function t(n){var r,u;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return(r=document.createElement("style")).type="text/css",r.id="googlefonts",r.innerText=n,document.head.append(r),u=Object(c.a)(new Set(Object(c.a)(e.querySelectorAll(".rmg-name__zh")).map((function(e){return e.innerHTML})).join("").replace(/[\d\w\s]/g,""))),t.abrupt("return",Promise.all(u.map(i)).then((function(e){var t,n;return null===(t=document.querySelector("style#googlefonts"))||void 0===t||t.remove(),Object(c.a)(new Set((n=[]).concat.apply(n,Object(c.a)(e)))).map((function(e){return fetch(e.match(/https:[\w:/.-]+.woff2/g)[0]).then((function(e){return e.blob()})).then(s).then((function(t){return e.replace(/src:[ \w('",\-:/.)]+;/g,"src: url('".concat(t,"'); "))}))}))})));case 7:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}())}}}]);
//# sourceMappingURL=panelPreviewMTR.87c1a705.chunk.js.map