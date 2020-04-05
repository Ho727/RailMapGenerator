(this["webpackJsonprail-map-generator"]=this["webpackJsonprail-map-generator"]||[]).push([[74],{100:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(2),l=n(5),s=n(6);t.default=function(e){var t=Object(a.useContext)(l.a).rmgStyle;return r.a.createElement(i.List,{component:"div"},"gzmtr"===t&&r.a.createElement(u,e),r.a.createElement(c,e),"gzmtr"===t&&r.a.createElement(m,e))};var o=Object(i.makeStyles)((function(){return Object(i.createStyles)({lineNumRoot:{display:"inline-flex",alignItems:"center",justifyContent:"center",border:"solid 2px",borderRightWidth:1,borderRadius:"32px 0 0 32px",padding:"2px 5px",minWidth:32,height:32,fontSize:"1.5rem"},numInput:{display:"inline-block",border:"solid 2px",borderLeftWidth:1,borderRadius:"0 32px 32px 0",padding:"2px 5px",width:32,height:32,"& .MuiInputBase-root":{marginTop:1.7},"& .MuiInputBase-input":{fontSize:"1.5rem",padding:"unset",textAlign:"center"}},nameInputZH:{"& .MuiInputBase-input":{textAlign:"center",fontSize:"3rem",lineHeight:"3rem"}},nameInputEN:{"& .MuiInputBase-input":{textAlign:"center",fontSize:"1.2rem",lineHeight:"1.2rem"}},"nameInputZH-mtr":{"& .MuiInputBase-input":{fontFamily:["Myriad Pro","Vegur","Noto Serif KR","Noto Serif JP","Noto Serif TC","Noto Serif SC","HiraMinProN-W6","serif"].join()}},"nameInputEN-mtr":{"& .MuiInputBase-input":{fontFamily:["Myriad Pro","Vegur","Arial","sans-serif"].join()}},"nameInputZH-gzmtr":{"& .MuiInputBase-input":{fontFamily:["Arial","STKaiti","KaiTi","sans-serif"].join()}},collapseWrapper:{justifyContent:"center"},collapseWrapperInner:{width:"65%"},secondaryNameRoot:{display:"flex",justifyContent:"center",alignItems:"center","& .MuiInputBase-input":{textAlign:"center"}},secondaryNameParenthesis:{fontSize:"4rem"},secondaryNameInputRoot:{display:"flex",flexDirection:"column",width:"100%"},secondaryNameInputZH:{"& .MuiInputBase-input":{fontSize:"1.5rem",lineHeight:"1.5rem"}}})})),u=function(e){var t,n=o(),s=Object(a.useContext)(l.b),u=s.param,c=s.dispatch;return r.a.createElement(i.ListItem,{style:{justifyContent:"center"}},r.a.createElement("div",{className:n.lineNumRoot},r.a.createElement("span",null,u.line_num)),r.a.createElement(i.TextField,{fullWidth:!0,className:n.numInput,value:null===(t=u.stn_list[e.stnId])||void 0===t?void 0:t.num,onChange:function(t){return c({type:"UPDATE_STATION_NUM",stnId:e.stnId,num:t.target.value})}}))},c=function(e){var t=Object(s.useTranslation)().t,n=o(),u=Object(a.useContext)(l.a).rmgStyle,c=Object(a.useContext)(l.b),m=c.param,p=c.dispatch,d=(m.stn_list[e.stnId]||m.stn_list.linestart).name;return r.a.createElement(i.ListItem,{style:{flexDirection:"column"}},r.a.createElement(i.TextField,{fullWidth:!0,placeholder:t("editor.zh"),className:"".concat(n.nameInputZH," ").concat("gzmtr"===u?n["nameInputZH-gzmtr"]:"mtr"===u?n["nameInputZH-mtr"]:""),value:d[0],onChange:function(t){return p({type:"UPDATE_STATION_NAME",stnId:e.stnId,name:[t.target.value,d[1]]})},autoFocus:!0}),r.a.createElement(i.TextField,{fullWidth:!0,placeholder:t("editor.en"),className:"".concat(n.nameInputEN," ").concat("mtr"===u?n["nameInputEN-mtr"]:""),value:d[1],onChange:function(t){return p({type:"UPDATE_STATION_NAME",stnId:e.stnId,name:[d[0],t.target.value]})},helperText:t("editor.backslashToWrap")}))},m=function(e){var t=Object(s.useTranslation)().t,n=o(),u=Object(a.useContext)(l.b),c=u.param,m=u.dispatch,p=(c.stn_list[e.stnId]||c.stn_list.linestart).secondaryName;return r.a.createElement(r.a.Fragment,null,r.a.createElement(i.ListItem,null,r.a.createElement(i.ListItemIcon,null,r.a.createElement(i.Icon,null,"text_fields")),r.a.createElement(i.ListItemText,{primary:t("stations.edit.name.secondary")}),r.a.createElement(i.ListItemSecondaryAction,null,r.a.createElement(i.Switch,{color:"primary",edge:"end",checked:!1!==p,onChange:function(t,n){return m({type:"UPDATE_STATION_SECONDARY_NAME",stnId:e.stnId,name:!!n&&["",""]})}}))),r.a.createElement(i.Collapse,{in:!1!==p,unmountOnExit:!0,classes:{wrapper:n.collapseWrapper,wrapperInner:n.collapseWrapperInner}},r.a.createElement("div",{className:n.secondaryNameRoot},r.a.createElement("span",{className:n.secondaryNameParenthesis},"("),r.a.createElement("div",{className:n.secondaryNameInputRoot},r.a.createElement(i.TextField,{fullWidth:!0,placeholder:t("editor.zh"),className:n.secondaryNameInputZH,value:p?p[0]:"",onChange:function(t){return m({type:"UPDATE_STATION_SECONDARY_NAME",stnId:e.stnId,name:[t.target.value,p?p[1]:""]})}}),r.a.createElement(i.TextField,{fullWidth:!0,placeholder:t("editor.en"),value:p?p[1]:"",onChange:function(t){return m({type:"UPDATE_STATION_SECONDARY_NAME",stnId:e.stnId,name:[p?p[0]:"",t.target.value]})}})),r.a.createElement("span",{className:n.secondaryNameParenthesis},")"))))}}}]);
//# sourceMappingURL=panelStationsName.f4168268.chunk.js.map