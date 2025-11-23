// @google/genai@1.29.1 downloaded from https://ga.jspm.io/npm:@google/genai@1.29.1/dist/web/index.mjs

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let e;let t;function n(n){e=n.geminiUrl;t=n.vertexUrl}function o(){return{geminiUrl:e,vertexUrl:t}}function s(e,t,n,s){var i,r;if(!(e===null||e===void 0?void 0:e.baseUrl)){const e=o();return t?(i=e.vertexUrl)!==null&&i!==void 0?i:n:(r=e.geminiUrl)!==null&&r!==void 0?r:s}return e.baseUrl}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class BaseModule{}function i(e,t){const n=/\{([^}]+)\}/g;return e.replace(n,((e,n)=>{if(Object.prototype.hasOwnProperty.call(t,n)){const e=t[n];return e!==void 0&&e!==null?String(e):""}throw new Error(`Key '${n}' not found in valueMap.`)}))}function r(e,t,n){for(let o=0;o<t.length-1;o++){const s=t[o];if(s.endsWith("[]")){const i=s.slice(0,-2);if(!(i in e)){if(!Array.isArray(n))throw new Error(`Value must be a list given an array path ${s}`);e[i]=Array.from({length:n.length},(()=>({})))}if(Array.isArray(e[i])){const s=e[i];if(Array.isArray(n))for(let e=0;e<s.length;e++){const i=s[e];r(i,t.slice(o+1),n[e])}else for(const e of s)r(e,t.slice(o+1),n)}return}if(s.endsWith("[0]")){const i=s.slice(0,-3);i in e||(e[i]=[{}]);const l=e[i];r(l[0],t.slice(o+1),n);return}e[s]&&typeof e[s]==="object"||(e[s]={});e=e[s]}const o=t[t.length-1];const s=e[o];if(s!==void 0){if(!n||typeof n==="object"&&Object.keys(n).length===0)return;if(n===s)return;if(typeof s!=="object"||typeof n!=="object"||s===null||n===null)throw new Error(`Cannot set value for an existing key. Key: ${o}`);Object.assign(s,n)}else if(o!=="_self"||typeof n!=="object"||n===null||Array.isArray(n))e[o]=n;else{const t=n;Object.assign(e,t)}}function l(e,t,n=void 0){try{if(t.length===1&&t[0]==="_self")return e;for(let o=0;o<t.length;o++){if(typeof e!=="object"||e===null)return n;const s=t[o];if(s.endsWith("[]")){const i=s.slice(0,-2);if(i in e){const s=e[i];return Array.isArray(s)?s.map((e=>l(e,t.slice(o+1),n))):n}return n}e=e[s]}return e}catch(e){if(e instanceof TypeError)return n;throw e}}function a(e,t){for(const[n,o]of Object.entries(t)){const t=n.split(".");const s=o.split(".");const i=new Set;let r=-1;for(let e=0;e<t.length;e++)if(t[e]==="*"){r=e;break}if(r!==-1&&s.length>r)for(let e=r;e<s.length;e++){const t=s[e];t==="*"||t.endsWith("[]")||t.endsWith("[0]")||i.add(t)}c(e,t,s,0,i)}}function c(e,t,n,o,s){if(o>=t.length)return;if(typeof e!=="object"||e===null)return;const i=t[o];if(i.endsWith("[]")){const r=i.slice(0,-2);const l=e;if(r in l&&Array.isArray(l[r]))for(const e of l[r])c(e,t,n,o+1,s)}else if(i==="*"){if(typeof e==="object"&&e!==null&&!Array.isArray(e)){const t=e;const i=Object.keys(t).filter((e=>!e.startsWith("_")&&!s.has(e)));const l={};for(const e of i)l[e]=t[e];for(const[e,s]of Object.entries(l)){const i=[];for(const t of n.slice(o))t==="*"?i.push(e):i.push(t);r(t,i,s)}for(const e of i)delete t[e]}}else{const r=e;i in r&&c(r[i],t,n,o+1,s)}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function u(e){if(typeof e!=="string")throw new Error("fromImageBytes must be a string");return e}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function p(e){const t={};const n=l(e,["operationName"]);n!=null&&r(t,["operationName"],n);const o=l(e,["resourceName"]);o!=null&&r(t,["_url","resourceName"],o);return t}function d(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response","generateVideoResponse"]);a!=null&&r(t,["response"],f(a));return t}function h(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],m(a));return t}function f(e){const t={};const n=l(e,["generatedSamples"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>g(e))));r(t,["generatedVideos"],e)}const o=l(e,["raiMediaFilteredCount"]);o!=null&&r(t,["raiMediaFilteredCount"],o);const s=l(e,["raiMediaFilteredReasons"]);s!=null&&r(t,["raiMediaFilteredReasons"],s);return t}function m(e){const t={};const n=l(e,["videos"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>v(e))));r(t,["generatedVideos"],e)}const o=l(e,["raiMediaFilteredCount"]);o!=null&&r(t,["raiMediaFilteredCount"],o);const s=l(e,["raiMediaFilteredReasons"]);s!=null&&r(t,["raiMediaFilteredReasons"],s);return t}function g(e){const t={};const n=l(e,["video"]);n!=null&&r(t,["video"],A(n));return t}function v(e){const t={};const n=l(e,["_self"]);n!=null&&r(t,["video"],S(n));return t}function y(e){const t={};const n=l(e,["operationName"]);n!=null&&r(t,["_url","operationName"],n);return t}function E(e){const t={};const n=l(e,["operationName"]);n!=null&&r(t,["_url","operationName"],n);return t}function _(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],I(a));return t}function I(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["parent"]);o!=null&&r(t,["parent"],o);const s=l(e,["documentName"]);s!=null&&r(t,["documentName"],s);return t}function T(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],C(a));return t}function C(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["parent"]);o!=null&&r(t,["parent"],o);const s=l(e,["documentName"]);s!=null&&r(t,["documentName"],s);return t}function A(e){const t={};const n=l(e,["uri"]);n!=null&&r(t,["uri"],n);const o=l(e,["encodedVideo"]);o!=null&&r(t,["videoBytes"],u(o));const s=l(e,["encoding"]);s!=null&&r(t,["mimeType"],s);return t}function S(e){const t={};const n=l(e,["gcsUri"]);n!=null&&r(t,["uri"],n);const o=l(e,["bytesBase64Encoded"]);o!=null&&r(t,["videoBytes"],u(o));const s=l(e,["mimeType"]);s!=null&&r(t,["mimeType"],s);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */var O;(function(e){e.OUTCOME_UNSPECIFIED="OUTCOME_UNSPECIFIED";e.OUTCOME_OK="OUTCOME_OK";e.OUTCOME_FAILED="OUTCOME_FAILED";e.OUTCOME_DEADLINE_EXCEEDED="OUTCOME_DEADLINE_EXCEEDED"})(O||(O={}));var R;(function(e){e.LANGUAGE_UNSPECIFIED="LANGUAGE_UNSPECIFIED";e.PYTHON="PYTHON"})(R||(R={}));var b;(function(e){e.SCHEDULING_UNSPECIFIED="SCHEDULING_UNSPECIFIED";e.SILENT="SILENT";e.WHEN_IDLE="WHEN_IDLE";e.INTERRUPT="INTERRUPT"})(b||(b={}));var N;(function(e){e.TYPE_UNSPECIFIED="TYPE_UNSPECIFIED";e.STRING="STRING";e.NUMBER="NUMBER";e.INTEGER="INTEGER";e.BOOLEAN="BOOLEAN";e.ARRAY="ARRAY";e.OBJECT="OBJECT";e.NULL="NULL"})(N||(N={}));var P;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED";e.MODE_DYNAMIC="MODE_DYNAMIC"})(P||(P={}));var w;(function(e){e.API_SPEC_UNSPECIFIED="API_SPEC_UNSPECIFIED";e.SIMPLE_SEARCH="SIMPLE_SEARCH";e.ELASTIC_SEARCH="ELASTIC_SEARCH"})(w||(w={}));var M;(function(e){e.AUTH_TYPE_UNSPECIFIED="AUTH_TYPE_UNSPECIFIED";e.NO_AUTH="NO_AUTH";e.API_KEY_AUTH="API_KEY_AUTH";e.HTTP_BASIC_AUTH="HTTP_BASIC_AUTH";e.GOOGLE_SERVICE_ACCOUNT_AUTH="GOOGLE_SERVICE_ACCOUNT_AUTH";e.OAUTH="OAUTH";e.OIDC_AUTH="OIDC_AUTH"})(M||(M={}));var D;(function(e){e.HTTP_IN_UNSPECIFIED="HTTP_IN_UNSPECIFIED";e.HTTP_IN_QUERY="HTTP_IN_QUERY";e.HTTP_IN_HEADER="HTTP_IN_HEADER";e.HTTP_IN_PATH="HTTP_IN_PATH";e.HTTP_IN_BODY="HTTP_IN_BODY";e.HTTP_IN_COOKIE="HTTP_IN_COOKIE"})(D||(D={}));var U;(function(e){e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED="PHISH_BLOCK_THRESHOLD_UNSPECIFIED";e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE";e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE";e.BLOCK_HIGH_AND_ABOVE="BLOCK_HIGH_AND_ABOVE";e.BLOCK_HIGHER_AND_ABOVE="BLOCK_HIGHER_AND_ABOVE";e.BLOCK_VERY_HIGH_AND_ABOVE="BLOCK_VERY_HIGH_AND_ABOVE";e.BLOCK_ONLY_EXTREMELY_HIGH="BLOCK_ONLY_EXTREMELY_HIGH"})(U||(U={}));var k;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED";e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT";e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH";e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT";e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT";e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY";e.HARM_CATEGORY_IMAGE_HATE="HARM_CATEGORY_IMAGE_HATE";e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT="HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT";e.HARM_CATEGORY_IMAGE_HARASSMENT="HARM_CATEGORY_IMAGE_HARASSMENT";e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT="HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT";e.HARM_CATEGORY_JAILBREAK="HARM_CATEGORY_JAILBREAK"})(k||(k={}));var L;(function(e){e.HARM_BLOCK_METHOD_UNSPECIFIED="HARM_BLOCK_METHOD_UNSPECIFIED";e.SEVERITY="SEVERITY";e.PROBABILITY="PROBABILITY"})(L||(L={}));var q;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED";e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE";e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE";e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH";e.BLOCK_NONE="BLOCK_NONE";e.OFF="OFF"})(q||(q={}));var x;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED";e.STOP="STOP";e.MAX_TOKENS="MAX_TOKENS";e.SAFETY="SAFETY";e.RECITATION="RECITATION";e.LANGUAGE="LANGUAGE";e.OTHER="OTHER";e.BLOCKLIST="BLOCKLIST";e.PROHIBITED_CONTENT="PROHIBITED_CONTENT";e.SPII="SPII";e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL";e.IMAGE_SAFETY="IMAGE_SAFETY";e.UNEXPECTED_TOOL_CALL="UNEXPECTED_TOOL_CALL";e.IMAGE_PROHIBITED_CONTENT="IMAGE_PROHIBITED_CONTENT";e.NO_IMAGE="NO_IMAGE"})(x||(x={}));var G;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED";e.NEGLIGIBLE="NEGLIGIBLE";e.LOW="LOW";e.MEDIUM="MEDIUM";e.HIGH="HIGH"})(G||(G={}));var F;(function(e){e.HARM_SEVERITY_UNSPECIFIED="HARM_SEVERITY_UNSPECIFIED";e.HARM_SEVERITY_NEGLIGIBLE="HARM_SEVERITY_NEGLIGIBLE";e.HARM_SEVERITY_LOW="HARM_SEVERITY_LOW";e.HARM_SEVERITY_MEDIUM="HARM_SEVERITY_MEDIUM";e.HARM_SEVERITY_HIGH="HARM_SEVERITY_HIGH"})(F||(F={}));var H;(function(e){e.URL_RETRIEVAL_STATUS_UNSPECIFIED="URL_RETRIEVAL_STATUS_UNSPECIFIED";e.URL_RETRIEVAL_STATUS_SUCCESS="URL_RETRIEVAL_STATUS_SUCCESS";e.URL_RETRIEVAL_STATUS_ERROR="URL_RETRIEVAL_STATUS_ERROR";e.URL_RETRIEVAL_STATUS_PAYWALL="URL_RETRIEVAL_STATUS_PAYWALL";e.URL_RETRIEVAL_STATUS_UNSAFE="URL_RETRIEVAL_STATUS_UNSAFE"})(H||(H={}));var V;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED";e.SAFETY="SAFETY";e.OTHER="OTHER";e.BLOCKLIST="BLOCKLIST";e.PROHIBITED_CONTENT="PROHIBITED_CONTENT";e.IMAGE_SAFETY="IMAGE_SAFETY";e.MODEL_ARMOR="MODEL_ARMOR";e.JAILBREAK="JAILBREAK"})(V||(V={}));var j;(function(e){e.TRAFFIC_TYPE_UNSPECIFIED="TRAFFIC_TYPE_UNSPECIFIED";e.ON_DEMAND="ON_DEMAND";e.PROVISIONED_THROUGHPUT="PROVISIONED_THROUGHPUT"})(j||(j={}));var B;(function(e){e.MODALITY_UNSPECIFIED="MODALITY_UNSPECIFIED";e.TEXT="TEXT";e.IMAGE="IMAGE";e.AUDIO="AUDIO"})(B||(B={}));var J;(function(e){e.MEDIA_RESOLUTION_UNSPECIFIED="MEDIA_RESOLUTION_UNSPECIFIED";e.MEDIA_RESOLUTION_LOW="MEDIA_RESOLUTION_LOW";e.MEDIA_RESOLUTION_MEDIUM="MEDIA_RESOLUTION_MEDIUM";e.MEDIA_RESOLUTION_HIGH="MEDIA_RESOLUTION_HIGH"})(J||(J={}));var Y;(function(e){e.TUNING_MODE_UNSPECIFIED="TUNING_MODE_UNSPECIFIED";e.TUNING_MODE_FULL="TUNING_MODE_FULL";e.TUNING_MODE_PEFT_ADAPTER="TUNING_MODE_PEFT_ADAPTER"})(Y||(Y={}));var W;(function(e){e.ADAPTER_SIZE_UNSPECIFIED="ADAPTER_SIZE_UNSPECIFIED";e.ADAPTER_SIZE_ONE="ADAPTER_SIZE_ONE";e.ADAPTER_SIZE_TWO="ADAPTER_SIZE_TWO";e.ADAPTER_SIZE_FOUR="ADAPTER_SIZE_FOUR";e.ADAPTER_SIZE_EIGHT="ADAPTER_SIZE_EIGHT";e.ADAPTER_SIZE_SIXTEEN="ADAPTER_SIZE_SIXTEEN";e.ADAPTER_SIZE_THIRTY_TWO="ADAPTER_SIZE_THIRTY_TWO"})(W||(W={}));var K;(function(e){e.JOB_STATE_UNSPECIFIED="JOB_STATE_UNSPECIFIED";e.JOB_STATE_QUEUED="JOB_STATE_QUEUED";e.JOB_STATE_PENDING="JOB_STATE_PENDING";e.JOB_STATE_RUNNING="JOB_STATE_RUNNING";e.JOB_STATE_SUCCEEDED="JOB_STATE_SUCCEEDED";e.JOB_STATE_FAILED="JOB_STATE_FAILED";e.JOB_STATE_CANCELLING="JOB_STATE_CANCELLING";e.JOB_STATE_CANCELLED="JOB_STATE_CANCELLED";e.JOB_STATE_PAUSED="JOB_STATE_PAUSED";e.JOB_STATE_EXPIRED="JOB_STATE_EXPIRED";e.JOB_STATE_UPDATING="JOB_STATE_UPDATING";e.JOB_STATE_PARTIALLY_SUCCEEDED="JOB_STATE_PARTIALLY_SUCCEEDED"})(K||(K={}));var $;(function(e){e.TUNING_TASK_UNSPECIFIED="TUNING_TASK_UNSPECIFIED";e.TUNING_TASK_I2V="TUNING_TASK_I2V";e.TUNING_TASK_T2V="TUNING_TASK_T2V";e.TUNING_TASK_R2V="TUNING_TASK_R2V"})($||($={}));var z;(function(e){e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED="FEATURE_SELECTION_PREFERENCE_UNSPECIFIED";e.PRIORITIZE_QUALITY="PRIORITIZE_QUALITY";e.BALANCED="BALANCED";e.PRIORITIZE_COST="PRIORITIZE_COST"})(z||(z={}));var X;(function(e){e.UNSPECIFIED="UNSPECIFIED";e.BLOCKING="BLOCKING";e.NON_BLOCKING="NON_BLOCKING"})(X||(X={}));var Q;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED";e.MODE_DYNAMIC="MODE_DYNAMIC"})(Q||(Q={}));var Z;(function(e){e.ENVIRONMENT_UNSPECIFIED="ENVIRONMENT_UNSPECIFIED";e.ENVIRONMENT_BROWSER="ENVIRONMENT_BROWSER"})(Z||(Z={}));var ee;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED";e.AUTO="AUTO";e.ANY="ANY";e.NONE="NONE";e.VALIDATED="VALIDATED"})(ee||(ee={}));var te;(function(e){e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE";e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE";e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH";e.BLOCK_NONE="BLOCK_NONE"})(te||(te={}));var ne;(function(e){e.DONT_ALLOW="DONT_ALLOW";e.ALLOW_ADULT="ALLOW_ADULT";e.ALLOW_ALL="ALLOW_ALL"})(ne||(ne={}));var oe;(function(e){e.auto="auto";e.en="en";e.ja="ja";e.ko="ko";e.hi="hi";e.zh="zh";e.pt="pt";e.es="es"})(oe||(oe={}));var se;(function(e){e.MASK_MODE_DEFAULT="MASK_MODE_DEFAULT";e.MASK_MODE_USER_PROVIDED="MASK_MODE_USER_PROVIDED";e.MASK_MODE_BACKGROUND="MASK_MODE_BACKGROUND";e.MASK_MODE_FOREGROUND="MASK_MODE_FOREGROUND";e.MASK_MODE_SEMANTIC="MASK_MODE_SEMANTIC"})(se||(se={}));var ie;(function(e){e.CONTROL_TYPE_DEFAULT="CONTROL_TYPE_DEFAULT";e.CONTROL_TYPE_CANNY="CONTROL_TYPE_CANNY";e.CONTROL_TYPE_SCRIBBLE="CONTROL_TYPE_SCRIBBLE";e.CONTROL_TYPE_FACE_MESH="CONTROL_TYPE_FACE_MESH"})(ie||(ie={}));var re;(function(e){e.SUBJECT_TYPE_DEFAULT="SUBJECT_TYPE_DEFAULT";e.SUBJECT_TYPE_PERSON="SUBJECT_TYPE_PERSON";e.SUBJECT_TYPE_ANIMAL="SUBJECT_TYPE_ANIMAL";e.SUBJECT_TYPE_PRODUCT="SUBJECT_TYPE_PRODUCT"})(re||(re={}));var le;(function(e){e.EDIT_MODE_DEFAULT="EDIT_MODE_DEFAULT";e.EDIT_MODE_INPAINT_REMOVAL="EDIT_MODE_INPAINT_REMOVAL";e.EDIT_MODE_INPAINT_INSERTION="EDIT_MODE_INPAINT_INSERTION";e.EDIT_MODE_OUTPAINT="EDIT_MODE_OUTPAINT";e.EDIT_MODE_CONTROLLED_EDITING="EDIT_MODE_CONTROLLED_EDITING";e.EDIT_MODE_STYLE="EDIT_MODE_STYLE";e.EDIT_MODE_BGSWAP="EDIT_MODE_BGSWAP";e.EDIT_MODE_PRODUCT_IMAGE="EDIT_MODE_PRODUCT_IMAGE"})(le||(le={}));var ae;(function(e){e.FOREGROUND="FOREGROUND";e.BACKGROUND="BACKGROUND";e.PROMPT="PROMPT";e.SEMANTIC="SEMANTIC";e.INTERACTIVE="INTERACTIVE"})(ae||(ae={}));var ce;(function(e){e.ASSET="ASSET";e.STYLE="STYLE"})(ce||(ce={}));var ue;(function(e){e.INSERT="INSERT";e.REMOVE="REMOVE";e.REMOVE_STATIC="REMOVE_STATIC";e.OUTPAINT="OUTPAINT"})(ue||(ue={}));var pe;(function(e){e.OPTIMIZED="OPTIMIZED";e.LOSSLESS="LOSSLESS"})(pe||(pe={}));var de;(function(e){e.SUPERVISED_FINE_TUNING="SUPERVISED_FINE_TUNING";e.PREFERENCE_TUNING="PREFERENCE_TUNING"})(de||(de={}));var he;(function(e){e.STATE_UNSPECIFIED="STATE_UNSPECIFIED";e.STATE_PENDING="STATE_PENDING";e.STATE_ACTIVE="STATE_ACTIVE";e.STATE_FAILED="STATE_FAILED"})(he||(he={}));var fe;(function(e){e.STATE_UNSPECIFIED="STATE_UNSPECIFIED";e.PROCESSING="PROCESSING";e.ACTIVE="ACTIVE";e.FAILED="FAILED"})(fe||(fe={}));var me;(function(e){e.SOURCE_UNSPECIFIED="SOURCE_UNSPECIFIED";e.UPLOADED="UPLOADED";e.GENERATED="GENERATED"})(me||(me={}));var ge;(function(e){e.TURN_COMPLETE_REASON_UNSPECIFIED="TURN_COMPLETE_REASON_UNSPECIFIED";e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL";e.RESPONSE_REJECTED="RESPONSE_REJECTED";e.NEED_MORE_INPUT="NEED_MORE_INPUT"})(ge||(ge={}));var ve;(function(e){e.MODALITY_UNSPECIFIED="MODALITY_UNSPECIFIED";e.TEXT="TEXT";e.IMAGE="IMAGE";e.VIDEO="VIDEO";e.AUDIO="AUDIO";e.DOCUMENT="DOCUMENT"})(ve||(ve={}));var ye;(function(e){e.START_SENSITIVITY_UNSPECIFIED="START_SENSITIVITY_UNSPECIFIED";e.START_SENSITIVITY_HIGH="START_SENSITIVITY_HIGH";e.START_SENSITIVITY_LOW="START_SENSITIVITY_LOW"})(ye||(ye={}));var Ee;(function(e){e.END_SENSITIVITY_UNSPECIFIED="END_SENSITIVITY_UNSPECIFIED";e.END_SENSITIVITY_HIGH="END_SENSITIVITY_HIGH";e.END_SENSITIVITY_LOW="END_SENSITIVITY_LOW"})(Ee||(Ee={}));var _e;(function(e){e.ACTIVITY_HANDLING_UNSPECIFIED="ACTIVITY_HANDLING_UNSPECIFIED";e.START_OF_ACTIVITY_INTERRUPTS="START_OF_ACTIVITY_INTERRUPTS";e.NO_INTERRUPTION="NO_INTERRUPTION"})(_e||(_e={}));var Ie;(function(e){e.TURN_COVERAGE_UNSPECIFIED="TURN_COVERAGE_UNSPECIFIED";e.TURN_INCLUDES_ONLY_ACTIVITY="TURN_INCLUDES_ONLY_ACTIVITY";e.TURN_INCLUDES_ALL_INPUT="TURN_INCLUDES_ALL_INPUT"})(Ie||(Ie={}));var Te;(function(e){e.SCALE_UNSPECIFIED="SCALE_UNSPECIFIED";e.C_MAJOR_A_MINOR="C_MAJOR_A_MINOR";e.D_FLAT_MAJOR_B_FLAT_MINOR="D_FLAT_MAJOR_B_FLAT_MINOR";e.D_MAJOR_B_MINOR="D_MAJOR_B_MINOR";e.E_FLAT_MAJOR_C_MINOR="E_FLAT_MAJOR_C_MINOR";e.E_MAJOR_D_FLAT_MINOR="E_MAJOR_D_FLAT_MINOR";e.F_MAJOR_D_MINOR="F_MAJOR_D_MINOR";e.G_FLAT_MAJOR_E_FLAT_MINOR="G_FLAT_MAJOR_E_FLAT_MINOR";e.G_MAJOR_E_MINOR="G_MAJOR_E_MINOR";e.A_FLAT_MAJOR_F_MINOR="A_FLAT_MAJOR_F_MINOR";e.A_MAJOR_G_FLAT_MINOR="A_MAJOR_G_FLAT_MINOR";e.B_FLAT_MAJOR_G_MINOR="B_FLAT_MAJOR_G_MINOR";e.B_MAJOR_A_FLAT_MINOR="B_MAJOR_A_FLAT_MINOR"})(Te||(Te={}));var Ce;(function(e){e.MUSIC_GENERATION_MODE_UNSPECIFIED="MUSIC_GENERATION_MODE_UNSPECIFIED";e.QUALITY="QUALITY";e.DIVERSITY="DIVERSITY";e.VOCALIZATION="VOCALIZATION"})(Ce||(Ce={}));var Ae;(function(e){e.PLAYBACK_CONTROL_UNSPECIFIED="PLAYBACK_CONTROL_UNSPECIFIED";e.PLAY="PLAY";e.PAUSE="PAUSE";e.STOP="STOP";e.RESET_CONTEXT="RESET_CONTEXT"})(Ae||(Ae={}));class FunctionResponseBlob{}class FunctionResponseFileData{}class FunctionResponsePart{}function Se(e,t){return{inlineData:{data:e,mimeType:t}}}function Oe(e,t){return{fileData:{fileUri:e,mimeType:t}}}class FunctionResponse{}function Re(e,t){return{fileData:{fileUri:e,mimeType:t}}}function be(e){return{text:e}}function Ne(e,t){return{functionCall:{name:e,args:t}}}function Pe(e,t,n,o=[]){return{functionResponse:Object.assign({id:e,name:t,response:n},o.length>0&&{parts:o})}}function we(e,t){return{inlineData:{data:e,mimeType:t}}}function Me(e,t){return{codeExecutionResult:{outcome:e,output:t}}}function De(e,t){return{executableCode:{code:e,language:t}}}function Ue(e){return typeof e==="object"&&e!==null&&("fileData"in e||"text"in e||"functionCall"in e||"functionResponse"in e||"inlineData"in e||"videoMetadata"in e||"codeExecutionResult"in e||"executableCode"in e)}function ke(e){const t=[];if(typeof e==="string")t.push(be(e));else if(Ue(e))t.push(e);else{if(!Array.isArray(e))throw new Error("partOrString must be a Part object, string, or array");if(e.length===0)throw new Error("partOrString cannot be an empty array");for(const n of e)if(typeof n==="string")t.push(be(n));else{if(!Ue(n))throw new Error("element in PartUnion must be a Part object or string");t.push(n)}}return t}function Le(e){return{role:"user",parts:ke(e)}}function qe(e){return{role:"model",parts:ke(e)}}class HttpResponse{constructor(e){const t={};for(const n of e.headers.entries())t[n[0]]=n[1];this.headers=t;this.responseInternal=e}json(){return this.responseInternal.json()}}class GenerateContentResponsePromptFeedback{}class GenerateContentResponseUsageMetadata{}class GenerateContentResponse{get text(){var e,t,n,o,s,i,r,l;if(((o=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||o===void 0?void 0:o.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning text from the first one.");let a="";let c=false;const u=[];for(const e of(l=(r=(i=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||i===void 0?void 0:i.content)===null||r===void 0?void 0:r.parts)!==null&&l!==void 0?l:[]){for(const[t,n]of Object.entries(e))t==="text"||t==="thought"||t==="thoughtSignature"||n===null&&n===void 0||u.push(t);if(typeof e.text==="string"){if(typeof e.thought==="boolean"&&e.thought)continue;c=true;a+=e.text}}u.length>0&&console.warn(`there are non-text parts ${u} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);return c?a:void 0}get data(){var e,t,n,o,s,i,r,l;if(((o=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||o===void 0?void 0:o.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning data from the first one.");let a="";const c=[];for(const e of(l=(r=(i=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||i===void 0?void 0:i.content)===null||r===void 0?void 0:r.parts)!==null&&l!==void 0?l:[]){for(const[t,n]of Object.entries(e))t==="inlineData"||n===null&&n===void 0||c.push(t);e.inlineData&&typeof e.inlineData.data==="string"&&(a+=atob(e.inlineData.data))}c.length>0&&console.warn(`there are non-data parts ${c} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`);return a.length>0?btoa(a):void 0}get functionCalls(){var e,t,n,o,s,i,r,l;if(((o=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||o===void 0?void 0:o.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning function calls from the first one.");const a=(l=(r=(i=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||i===void 0?void 0:i.content)===null||r===void 0?void 0:r.parts)===null||l===void 0?void 0:l.filter((e=>e.functionCall)).map((e=>e.functionCall)).filter((e=>e!==void 0));return(a===null||a===void 0?void 0:a.length)!==0?a:void 0}get executableCode(){var e,t,n,o,s,i,r,l,a;if(((o=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||o===void 0?void 0:o.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning executable code from the first one.");const c=(l=(r=(i=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||i===void 0?void 0:i.content)===null||r===void 0?void 0:r.parts)===null||l===void 0?void 0:l.filter((e=>e.executableCode)).map((e=>e.executableCode)).filter((e=>e!==void 0));return(c===null||c===void 0?void 0:c.length)!==0?(a=c===null||c===void 0?void 0:c[0])===null||a===void 0?void 0:a.code:void 0}get codeExecutionResult(){var e,t,n,o,s,i,r,l,a;if(((o=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||o===void 0?void 0:o.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning code execution result from the first one.");const c=(l=(r=(i=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||i===void 0?void 0:i.content)===null||r===void 0?void 0:r.parts)===null||l===void 0?void 0:l.filter((e=>e.codeExecutionResult)).map((e=>e.codeExecutionResult)).filter((e=>e!==void 0));return(c===null||c===void 0?void 0:c.length)!==0?(a=c===null||c===void 0?void 0:c[0])===null||a===void 0?void 0:a.output:void 0}}class EmbedContentResponse{}class GenerateImagesResponse{}class EditImageResponse{}class UpscaleImageResponse{}class RecontextImageResponse{}class SegmentImageResponse{}class ListModelsResponse{}class DeleteModelResponse{}class CountTokensResponse{}class ComputeTokensResponse{}class GenerateVideosResponse{}class GenerateVideosOperation{_fromAPIResponse({apiResponse:e,_isVertexAI:t}){const n=new GenerateVideosOperation;let o;const s=e;o=t?h(s):d(s);Object.assign(n,o);return n}}class ListTuningJobsResponse{}class DeleteCachedContentResponse{}class ListCachedContentsResponse{}class ListDocumentsResponse{}class ListFileSearchStoresResponse{}class UploadToFileSearchStoreResumableResponse{}class ImportFileResponse{}class ImportFileOperation{_fromAPIResponse({apiResponse:e,_isVertexAI:t}){const n=new ImportFileOperation;const o=e;const s=_(o);Object.assign(n,s);return n}}class ListFilesResponse{}class CreateFileResponse{}class DeleteFileResponse{}class InlinedResponse{}class SingleEmbedContentResponse{}class InlinedEmbedContentResponse{}class ListBatchJobsResponse{}class ReplayResponse{}class RawReferenceImage{toReferenceImageAPI(){const e={referenceType:"REFERENCE_TYPE_RAW",referenceImage:this.referenceImage,referenceId:this.referenceId};return e}}class MaskReferenceImage{toReferenceImageAPI(){const e={referenceType:"REFERENCE_TYPE_MASK",referenceImage:this.referenceImage,referenceId:this.referenceId,maskImageConfig:this.config};return e}}class ControlReferenceImage{toReferenceImageAPI(){const e={referenceType:"REFERENCE_TYPE_CONTROL",referenceImage:this.referenceImage,referenceId:this.referenceId,controlImageConfig:this.config};return e}}class StyleReferenceImage{toReferenceImageAPI(){const e={referenceType:"REFERENCE_TYPE_STYLE",referenceImage:this.referenceImage,referenceId:this.referenceId,styleImageConfig:this.config};return e}}class SubjectReferenceImage{toReferenceImageAPI(){const e={referenceType:"REFERENCE_TYPE_SUBJECT",referenceImage:this.referenceImage,referenceId:this.referenceId,subjectImageConfig:this.config};return e}}class ContentReferenceImage{toReferenceImageAPI(){const e={referenceType:"REFERENCE_TYPE_CONTENT",referenceImage:this.referenceImage,referenceId:this.referenceId};return e}}class LiveServerMessage{get text(){var e,t,n;let o="";let s=false;const i=[];for(const r of(n=(t=(e=this.serverContent)===null||e===void 0?void 0:e.modelTurn)===null||t===void 0?void 0:t.parts)!==null&&n!==void 0?n:[]){for(const[e,t]of Object.entries(r))e!=="text"&&e!=="thought"&&t!==null&&i.push(e);if(typeof r.text==="string"){if(typeof r.thought==="boolean"&&r.thought)continue;s=true;o+=r.text}}i.length>0&&console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);return s?o:void 0}get data(){var e,t,n;let o="";const s=[];for(const i of(n=(t=(e=this.serverContent)===null||e===void 0?void 0:e.modelTurn)===null||t===void 0?void 0:t.parts)!==null&&n!==void 0?n:[]){for(const[e,t]of Object.entries(i))e!=="inlineData"&&t!==null&&s.push(e);i.inlineData&&typeof i.inlineData.data==="string"&&(o+=atob(i.inlineData.data))}s.length>0&&console.warn(`there are non-data parts ${s} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`);return o.length>0?btoa(o):void 0}}class LiveClientToolResponse{}class LiveSendToolResponseParameters{constructor(){this.functionResponses=[]}}class LiveMusicServerMessage{get audioChunk(){if(this.serverContent&&this.serverContent.audioChunks&&this.serverContent.audioChunks.length>0)return this.serverContent.audioChunks[0]}}class UploadToFileSearchStoreResponse{}class UploadToFileSearchStoreOperation{_fromAPIResponse({apiResponse:e,_isVertexAI:t}){const n=new UploadToFileSearchStoreOperation;const o=e;const s=T(o);Object.assign(n,s);return n}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function xe(e,t){if(!t||typeof t!=="string")throw new Error("model is required and must be a string");if(t.includes("..")||t.includes("?")||t.includes("&"))throw new Error("invalid model parameter");if(e.isVertexAI()){if(t.startsWith("publishers/")||t.startsWith("projects/")||t.startsWith("models/"))return t;if(t.indexOf("/")>=0){const e=t.split("/",2);return`publishers/${e[0]}/models/${e[1]}`}return`publishers/google/models/${t}`}return t.startsWith("models/")||t.startsWith("tunedModels/")?t:`models/${t}`}function Ge(e,t){const n=xe(e,t);return n?n.startsWith("publishers/")&&e.isVertexAI()?`projects/${e.getProject()}/locations/${e.getLocation()}/${n}`:n.startsWith("models/")&&e.isVertexAI()?`projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}`:n:""}function Fe(e){return Array.isArray(e)?e.map((e=>He(e))):[He(e)]}function He(e){if(typeof e==="object"&&e!==null)return e;throw new Error("Could not parse input as Blob. Unsupported blob type: "+typeof e)}function Ve(e){const t=He(e);if(t.mimeType&&t.mimeType.startsWith("image/"))return t;throw new Error(`Unsupported mime type: ${t.mimeType}`)}function je(e){const t=He(e);if(t.mimeType&&t.mimeType.startsWith("audio/"))return t;throw new Error(`Unsupported mime type: ${t.mimeType}`)}function Be(e){if(e===null||e===void 0)throw new Error("PartUnion is required");if(typeof e==="object")return e;if(typeof e==="string")return{text:e};throw new Error("Unsupported part type: "+typeof e)}function Je(e){if(e===null||e===void 0||Array.isArray(e)&&e.length===0)throw new Error("PartListUnion is required");return Array.isArray(e)?e.map((e=>Be(e))):[Be(e)]}function Ye(e){return e!==null&&e!==void 0&&typeof e==="object"&&"parts"in e&&Array.isArray(e.parts)}function We(e){return e!==null&&e!==void 0&&typeof e==="object"&&"functionCall"in e}function Ke(e){return e!==null&&e!==void 0&&typeof e==="object"&&"functionResponse"in e}function $e(e){if(e===null||e===void 0)throw new Error("ContentUnion is required");return Ye(e)?e:{role:"user",parts:Je(e)}}function ze(e,t){if(!t)return[];if(e.isVertexAI()&&Array.isArray(t))return t.flatMap((e=>{const t=$e(e);return t.parts&&t.parts.length>0&&t.parts[0].text!==void 0?[t.parts[0].text]:[]}));if(e.isVertexAI()){const e=$e(t);return e.parts&&e.parts.length>0&&e.parts[0].text!==void 0?[e.parts[0].text]:[]}return Array.isArray(t)?t.map((e=>$e(e))):[$e(t)]}function Xe(e){if(e===null||e===void 0||Array.isArray(e)&&e.length===0)throw new Error("contents are required");if(!Array.isArray(e)){if(We(e)||Ke(e))throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");return[$e(e)]}const t=[];const n=[];const o=Ye(e[0]);for(const s of e){const e=Ye(s);if(e!=o)throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");if(e)t.push(s);else{if(We(s)||Ke(s))throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");n.push(s)}}o||t.push({role:"user",parts:Je(n)});return t}function Qe(e,t){e.includes("null")&&(t.nullable=true);const n=e.filter((e=>e!=="null"));if(n.length===1)t.type=Object.values(N).includes(n[0].toUpperCase())?n[0].toUpperCase():N.TYPE_UNSPECIFIED;else{t.anyOf=[];for(const e of n)t.anyOf.push({type:Object.values(N).includes(e.toUpperCase())?e.toUpperCase():N.TYPE_UNSPECIFIED})}}function Ze(e){const t={};const n=["items"];const o=["anyOf"];const s=["properties"];if(e.type&&e.anyOf)throw new Error("type and anyOf cannot be both populated.");const i=e.anyOf;if(i!=null&&i.length==2)if(i[0].type==="null"){t.nullable=true;e=i[1]}else if(i[1].type==="null"){t.nullable=true;e=i[0]}e.type instanceof Array&&Qe(e.type,t);for(const[i,r]of Object.entries(e))if(r!=null)if(i=="type"){if(r==="null")throw new Error("type: null can not be the only possible type for the field.");if(r instanceof Array)continue;t.type=Object.values(N).includes(r.toUpperCase())?r.toUpperCase():N.TYPE_UNSPECIFIED}else if(n.includes(i))t[i]=Ze(r);else if(o.includes(i)){const e=[];for(const n of r)n.type!="null"?e.push(Ze(n)):t.nullable=true;t[i]=e}else if(s.includes(i)){const e={};for(const[t,n]of Object.entries(r))e[t]=Ze(n);t[i]=e}else{if(i==="additionalProperties")continue;t[i]=r}return t}function et(e){return Ze(e)}function tt(e){if(typeof e==="object")return e;if(typeof e==="string")return{voiceConfig:{prebuiltVoiceConfig:{voiceName:e}}};throw new Error("Unsupported speechConfig type: "+typeof e)}function nt(e){if("multiSpeakerVoiceConfig"in e)throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");return e}function ot(e){if(e.functionDeclarations)for(const t of e.functionDeclarations){if(t.parameters)if(Object.keys(t.parameters).includes("$schema")){if(!t.parametersJsonSchema){t.parametersJsonSchema=t.parameters;delete t.parameters}}else t.parameters=Ze(t.parameters);if(t.response)if(Object.keys(t.response).includes("$schema")){if(!t.responseJsonSchema){t.responseJsonSchema=t.response;delete t.response}}else t.response=Ze(t.response)}return e}function st(e){if(e===void 0||e===null)throw new Error("tools is required");if(!Array.isArray(e))throw new Error("tools is required and must be an array of Tools");const t=[];for(const n of e)t.push(n);return t}
/**
 * Prepends resource name with project, location, resource_prefix if needed.
 *
 * @param client The API client.
 * @param resourceName The resource name.
 * @param resourcePrefix The resource prefix.
 * @param splitsAfterPrefix The number of splits after the prefix.
 * @returns The completed resource name.
 *
 * Examples:
 *
 * ```
 * resource_name = '123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = True
 * client.project = 'bar'
 * client.location = 'us-west1'
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * returns: 'projects/bar/locations/us-west1/cachedContents/123'
 * ```
 *
 * ```
 * resource_name = 'projects/foo/locations/us-central1/cachedContents/123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = True
 * client.project = 'bar'
 * client.location = 'us-west1'
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * returns: 'projects/foo/locations/us-central1/cachedContents/123'
 * ```
 *
 * ```
 * resource_name = '123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = False
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * returns 'cachedContents/123'
 * ```
 *
 * ```
 * resource_name = 'some/wrong/cachedContents/resource/name/123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = False
 * # client.vertexai = True
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * -> 'some/wrong/resource/name/123'
 * ```
 */function it(e,t,n,o=1){const s=!t.startsWith(`${n}/`)&&t.split("/").length===o;return e.isVertexAI()?t.startsWith("projects/")?t:t.startsWith("locations/")?`projects/${e.getProject()}/${t}`:t.startsWith(`${n}/`)?`projects/${e.getProject()}/locations/${e.getLocation()}/${t}`:s?`projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}`:t:s?`${n}/${t}`:t}function rt(e,t){if(typeof t!=="string")throw new Error("name must be a string");return it(e,t,"cachedContents")}function lt(e){switch(e){case"STATE_UNSPECIFIED":return"JOB_STATE_UNSPECIFIED";case"CREATING":return"JOB_STATE_RUNNING";case"ACTIVE":return"JOB_STATE_SUCCEEDED";case"FAILED":return"JOB_STATE_FAILED";default:return e}}function at(e){return u(e)}function ct(e){return e!==null&&e!==void 0&&typeof e==="object"&&"name"in e}function ut(e){return e!==null&&e!==void 0&&typeof e==="object"&&"video"in e}function pt(e){return e!==null&&e!==void 0&&typeof e==="object"&&"uri"in e}function dt(e){var t;let n;ct(e)&&(n=e.name);if(pt(e)){n=e.uri;if(n===void 0)return}if(ut(e)){n=(t=e.video)===null||t===void 0?void 0:t.uri;if(n===void 0)return}typeof e==="string"&&(n=e);if(n===void 0)throw new Error("Could not extract file name from the provided input.");if(n.startsWith("https://")){const e=n.split("files/")[1];const t=e.match(/[a-z0-9]+/);if(t===null)throw new Error(`Could not extract file name from URI ${n}`);n=t[0]}else n.startsWith("files/")&&(n=n.split("files/")[1]);return n}function ht(e,t){let n;n=e.isVertexAI()?t?"publishers/google/models":"models":t?"models":"tunedModels";return n}function ft(e){for(const t of["models","tunedModels","publisherModels"])if(mt(e,t))return e[t];return[]}function mt(e,t){return e!==null&&typeof e==="object"&&t in e}function gt(e,t={}){const n=e;const o={name:n.name,description:n.description,parametersJsonSchema:n.inputSchema};n.outputSchema&&(o.responseJsonSchema=n.outputSchema);t.behavior&&(o.behavior=t.behavior);const s={functionDeclarations:[o]};return s}function vt(e,t={}){const n=[];const o=new Set;for(const s of e){const e=s.name;if(o.has(e))throw new Error(`Duplicate function name ${e} found in MCP tools. Please ensure function names are unique.`);o.add(e);const i=gt(s,t);i.functionDeclarations&&n.push(...i.functionDeclarations)}return{functionDeclarations:n}}function yt(e,t){let n;if(typeof t==="string")if(e.isVertexAI())if(t.startsWith("gs://"))n={format:"jsonl",gcsUri:[t]};else{if(!t.startsWith("bq://"))throw new Error(`Unsupported string source for Vertex AI: ${t}`);n={format:"bigquery",bigqueryUri:t}}else{if(!t.startsWith("files/"))throw new Error(`Unsupported string source for Gemini API: ${t}`);n={fileName:t}}else if(Array.isArray(t)){if(e.isVertexAI())throw new Error("InlinedRequest[] is not supported in Vertex AI.");n={inlinedRequests:t}}else n=t;const o=[n.gcsUri,n.bigqueryUri].filter(Boolean).length;const s=[n.inlinedRequests,n.fileName].filter(Boolean).length;if(e.isVertexAI()){if(s>0||o!==1)throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.")}else if(o>0||s!==1)throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");return n}function Et(e){if(typeof e!=="string")return e;const t=e;if(t.startsWith("gs://"))return{format:"jsonl",gcsUri:t};if(t.startsWith("bq://"))return{format:"bigquery",bigqueryUri:t};throw new Error(`Unsupported destination: ${t}`)}function _t(e){if(typeof e!=="object"||e===null)return{};const t=e;const n=t.inlinedResponses;if(typeof n!=="object"||n===null)return e;const o=n;const s=o.inlinedResponses;if(!Array.isArray(s)||s.length===0)return e;let i=false;for(const e of s){if(typeof e!=="object"||e===null)continue;const t=e;const n=t.response;if(typeof n!=="object"||n===null)continue;const o=n;if(o.embedding!==void 0){i=true;break}}if(i){t.inlinedEmbedContentResponses=t.inlinedResponses;delete t.inlinedResponses}return e}function It(e,t){const n=t;if(!e.isVertexAI()){const e=/batches\/[^/]+$/;if(e.test(n))return n.split("/").pop();throw new Error(`Invalid batch job name: ${n}.`)}const o=/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/;if(o.test(n))return n.split("/").pop();if(/^\d+$/.test(n))return n;throw new Error(`Invalid batch job name: ${n}.`)}function Tt(e){const t=e;return t==="BATCH_STATE_UNSPECIFIED"?"JOB_STATE_UNSPECIFIED":t==="BATCH_STATE_PENDING"?"JOB_STATE_PENDING":t==="BATCH_STATE_RUNNING"?"JOB_STATE_RUNNING":t==="BATCH_STATE_SUCCEEDED"?"JOB_STATE_SUCCEEDED":t==="BATCH_STATE_FAILED"?"JOB_STATE_FAILED":t==="BATCH_STATE_CANCELLED"?"JOB_STATE_CANCELLED":t==="BATCH_STATE_EXPIRED"?"JOB_STATE_EXPIRED":t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Ct(e){const t={};const n=l(e,["responsesFile"]);n!=null&&r(t,["fileName"],n);const o=l(e,["inlinedResponses","inlinedResponses"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>sn(e))));r(t,["inlinedResponses"],e)}const s=l(e,["inlinedEmbedContentResponses","inlinedResponses"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["inlinedEmbedContentResponses"],e)}return t}function At(e){const t={};const n=l(e,["predictionsFormat"]);n!=null&&r(t,["format"],n);const o=l(e,["gcsDestination","outputUriPrefix"]);o!=null&&r(t,["gcsUri"],o);const s=l(e,["bigqueryDestination","outputUri"]);s!=null&&r(t,["bigqueryUri"],s);return t}function St(e){const t={};const n=l(e,["format"]);n!=null&&r(t,["predictionsFormat"],n);const o=l(e,["gcsUri"]);o!=null&&r(t,["gcsDestination","outputUriPrefix"],o);const s=l(e,["bigqueryUri"]);s!=null&&r(t,["bigqueryDestination","outputUri"],s);if(l(e,["fileName"])!==void 0)throw new Error("fileName parameter is not supported in Vertex AI.");if(l(e,["inlinedResponses"])!==void 0)throw new Error("inlinedResponses parameter is not supported in Vertex AI.");if(l(e,["inlinedEmbedContentResponses"])!==void 0)throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");return t}function Ot(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata","displayName"]);o!=null&&r(t,["displayName"],o);const s=l(e,["metadata","state"]);s!=null&&r(t,["state"],Tt(s));const i=l(e,["metadata","createTime"]);i!=null&&r(t,["createTime"],i);const a=l(e,["metadata","endTime"]);a!=null&&r(t,["endTime"],a);const c=l(e,["metadata","updateTime"]);c!=null&&r(t,["updateTime"],c);const u=l(e,["metadata","model"]);u!=null&&r(t,["model"],u);const p=l(e,["metadata","output"]);p!=null&&r(t,["dest"],Ct(_t(p)));return t}function Rt(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["displayName"]);o!=null&&r(t,["displayName"],o);const s=l(e,["state"]);s!=null&&r(t,["state"],Tt(s));const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["createTime"]);a!=null&&r(t,["createTime"],a);const c=l(e,["startTime"]);c!=null&&r(t,["startTime"],c);const u=l(e,["endTime"]);u!=null&&r(t,["endTime"],u);const p=l(e,["updateTime"]);p!=null&&r(t,["updateTime"],p);const d=l(e,["model"]);d!=null&&r(t,["model"],d);const h=l(e,["inputConfig"]);h!=null&&r(t,["src"],bt(h));const f=l(e,["outputConfig"]);f!=null&&r(t,["dest"],At(_t(f)));const m=l(e,["completionStats"]);m!=null&&r(t,["completionStats"],m);return t}function bt(e){const t={};const n=l(e,["instancesFormat"]);n!=null&&r(t,["format"],n);const o=l(e,["gcsSource","uris"]);o!=null&&r(t,["gcsUri"],o);const s=l(e,["bigquerySource","inputUri"]);s!=null&&r(t,["bigqueryUri"],s);return t}function Nt(e,t){const n={};if(l(t,["format"])!==void 0)throw new Error("format parameter is not supported in Gemini API.");if(l(t,["gcsUri"])!==void 0)throw new Error("gcsUri parameter is not supported in Gemini API.");if(l(t,["bigqueryUri"])!==void 0)throw new Error("bigqueryUri parameter is not supported in Gemini API.");const o=l(t,["fileName"]);o!=null&&r(n,["fileName"],o);const s=l(t,["inlinedRequests"]);if(s!=null){let t=s;Array.isArray(t)&&(t=t.map((t=>on(e,t))));r(n,["requests","requests"],t)}return n}function Pt(e){const t={};const n=l(e,["format"]);n!=null&&r(t,["instancesFormat"],n);const o=l(e,["gcsUri"]);o!=null&&r(t,["gcsSource","uris"],o);const s=l(e,["bigqueryUri"]);s!=null&&r(t,["bigquerySource","inputUri"],s);if(l(e,["fileName"])!==void 0)throw new Error("fileName parameter is not supported in Vertex AI.");if(l(e,["inlinedRequests"])!==void 0)throw new Error("inlinedRequests parameter is not supported in Vertex AI.");return t}function wt(e){const t={};const n=l(e,["data"]);n!=null&&r(t,["data"],n);if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function Mt(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],It(e,o));return n}function Dt(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],It(e,o));return n}function Ut(e){const t={};const n=l(e,["content"]);n!=null&&r(t,["content"],n);const o=l(e,["citationMetadata"]);o!=null&&r(t,["citationMetadata"],kt(o));const s=l(e,["tokenCount"]);s!=null&&r(t,["tokenCount"],s);const i=l(e,["finishReason"]);i!=null&&r(t,["finishReason"],i);const a=l(e,["avgLogprobs"]);a!=null&&r(t,["avgLogprobs"],a);const c=l(e,["groundingMetadata"]);c!=null&&r(t,["groundingMetadata"],c);const u=l(e,["index"]);u!=null&&r(t,["index"],u);const p=l(e,["logprobsResult"]);p!=null&&r(t,["logprobsResult"],p);const d=l(e,["safetyRatings"]);if(d!=null){let e=d;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["safetyRatings"],e)}const h=l(e,["urlContextMetadata"]);h!=null&&r(t,["urlContextMetadata"],h);return t}function kt(e){const t={};const n=l(e,["citationSources"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["citations"],e)}return t}function Lt(e){const t={};const n=l(e,["parts"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>dn(e))));r(t,["parts"],e)}const o=l(e,["role"]);o!=null&&r(t,["role"],o);return t}function qt(e,t){const n={};const o=l(e,["displayName"]);t!==void 0&&o!=null&&r(t,["batch","displayName"],o);if(l(e,["dest"])!==void 0)throw new Error("dest parameter is not supported in Gemini API.");return n}function xt(e,t){const n={};const o=l(e,["displayName"]);t!==void 0&&o!=null&&r(t,["displayName"],o);const s=l(e,["dest"]);t!==void 0&&s!=null&&r(t,["outputConfig"],St(Et(s)));return n}function Gt(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["src"]);s!=null&&r(n,["batch","inputConfig"],Nt(e,yt(e,s)));const i=l(t,["config"]);i!=null&&qt(i,n);return n}function Ft(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["model"],xe(e,o));const s=l(t,["src"]);s!=null&&r(n,["inputConfig"],Pt(yt(e,s)));const i=l(t,["config"]);i!=null&&xt(i,n);return n}function Ht(e,t){const n={};const o=l(e,["displayName"]);t!==void 0&&o!=null&&r(t,["batch","displayName"],o);return n}function Vt(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["src"]);s!=null&&r(n,["batch","inputConfig"],$t(e,s));const i=l(t,["config"]);i!=null&&Ht(i,n);return n}function jt(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],It(e,o));return n}function Bt(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],It(e,o));return n}function Jt(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["name"]);o!=null&&r(t,["name"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);return t}function Yt(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["name"]);o!=null&&r(t,["name"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);return t}function Wt(e,t){const n={};const o=l(t,["contents"]);if(o!=null){let t=ze(e,o);Array.isArray(t)&&(t=t.map((e=>e)));r(n,["requests[]","request","content"],t)}const s=l(t,["config"]);if(s!=null){r(n,["_self"],Kt(s,n));a(n,{"requests[].*":"requests[].request.*"})}return n}function Kt(e,t){const n={};const o=l(e,["taskType"]);t!==void 0&&o!=null&&r(t,["requests[]","taskType"],o);const s=l(e,["title"]);t!==void 0&&s!=null&&r(t,["requests[]","title"],s);const i=l(e,["outputDimensionality"]);t!==void 0&&i!=null&&r(t,["requests[]","outputDimensionality"],i);if(l(e,["mimeType"])!==void 0)throw new Error("mimeType parameter is not supported in Gemini API.");if(l(e,["autoTruncate"])!==void 0)throw new Error("autoTruncate parameter is not supported in Gemini API.");return n}function $t(e,t){const n={};const o=l(t,["fileName"]);o!=null&&r(n,["file_name"],o);const s=l(t,["inlinedRequests"]);s!=null&&r(n,["requests"],Wt(e,s));return n}function zt(e){const t={};if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const n=l(e,["fileUri"]);n!=null&&r(t,["fileUri"],n);const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function Xt(e,t,n){const o={};const s=l(t,["systemInstruction"]);n!==void 0&&s!=null&&r(n,["systemInstruction"],Lt($e(s)));const i=l(t,["temperature"]);i!=null&&r(o,["temperature"],i);const a=l(t,["topP"]);a!=null&&r(o,["topP"],a);const c=l(t,["topK"]);c!=null&&r(o,["topK"],c);const u=l(t,["candidateCount"]);u!=null&&r(o,["candidateCount"],u);const p=l(t,["maxOutputTokens"]);p!=null&&r(o,["maxOutputTokens"],p);const d=l(t,["stopSequences"]);d!=null&&r(o,["stopSequences"],d);const h=l(t,["responseLogprobs"]);h!=null&&r(o,["responseLogprobs"],h);const f=l(t,["logprobs"]);f!=null&&r(o,["logprobs"],f);const m=l(t,["presencePenalty"]);m!=null&&r(o,["presencePenalty"],m);const g=l(t,["frequencyPenalty"]);g!=null&&r(o,["frequencyPenalty"],g);const v=l(t,["seed"]);v!=null&&r(o,["seed"],v);const y=l(t,["responseMimeType"]);y!=null&&r(o,["responseMimeType"],y);const E=l(t,["responseSchema"]);E!=null&&r(o,["responseSchema"],et(E));const _=l(t,["responseJsonSchema"]);_!=null&&r(o,["responseJsonSchema"],_);if(l(t,["routingConfig"])!==void 0)throw new Error("routingConfig parameter is not supported in Gemini API.");if(l(t,["modelSelectionConfig"])!==void 0)throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");const I=l(t,["safetySettings"]);if(n!==void 0&&I!=null){let e=I;Array.isArray(e)&&(e=e.map((e=>hn(e))));r(n,["safetySettings"],e)}const T=l(t,["tools"]);if(n!==void 0&&T!=null){let e=st(T);Array.isArray(e)&&(e=e.map((e=>fn(ot(e)))));r(n,["tools"],e)}const C=l(t,["toolConfig"]);n!==void 0&&C!=null&&r(n,["toolConfig"],C);if(l(t,["labels"])!==void 0)throw new Error("labels parameter is not supported in Gemini API.");const A=l(t,["cachedContent"]);n!==void 0&&A!=null&&r(n,["cachedContent"],rt(e,A));const S=l(t,["responseModalities"]);S!=null&&r(o,["responseModalities"],S);const O=l(t,["mediaResolution"]);O!=null&&r(o,["mediaResolution"],O);const R=l(t,["speechConfig"]);R!=null&&r(o,["speechConfig"],tt(R));if(l(t,["audioTimestamp"])!==void 0)throw new Error("audioTimestamp parameter is not supported in Gemini API.");const b=l(t,["thinkingConfig"]);b!=null&&r(o,["thinkingConfig"],b);const N=l(t,["imageConfig"]);N!=null&&r(o,["imageConfig"],N);return o}function Qt(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["candidates"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>Ut(e))));r(t,["candidates"],e)}const s=l(e,["modelVersion"]);s!=null&&r(t,["modelVersion"],s);const i=l(e,["promptFeedback"]);i!=null&&r(t,["promptFeedback"],i);const a=l(e,["responseId"]);a!=null&&r(t,["responseId"],a);const c=l(e,["usageMetadata"]);c!=null&&r(t,["usageMetadata"],c);return t}function Zt(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],It(e,o));return n}function en(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],It(e,o));return n}function tn(e){const t={};if(l(e,["authConfig"])!==void 0)throw new Error("authConfig parameter is not supported in Gemini API.");const n=l(e,["enableWidget"]);n!=null&&r(t,["enableWidget"],n);return t}function nn(e){const t={};if(l(e,["excludeDomains"])!==void 0)throw new Error("excludeDomains parameter is not supported in Gemini API.");if(l(e,["blockingConfidence"])!==void 0)throw new Error("blockingConfidence parameter is not supported in Gemini API.");const n=l(e,["timeRangeFilter"]);n!=null&&r(t,["timeRangeFilter"],n);return t}function on(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["request","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let e=Xe(s);Array.isArray(e)&&(e=e.map((e=>Lt(e))));r(n,["request","contents"],e)}const i=l(t,["metadata"]);i!=null&&r(n,["metadata"],i);const a=l(t,["config"]);a!=null&&r(n,["request","generationConfig"],Xt(e,a,l(n,["request"],{})));return n}function sn(e){const t={};const n=l(e,["response"]);n!=null&&r(t,["response"],Qt(n));const o=l(e,["error"]);o!=null&&r(t,["error"],o);return t}function rn(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);if(l(e,["filter"])!==void 0)throw new Error("filter parameter is not supported in Gemini API.");return n}function ln(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);const i=l(e,["filter"]);t!==void 0&&i!=null&&r(t,["_query","filter"],i);return n}function an(e){const t={};const n=l(e,["config"]);n!=null&&rn(n,t);return t}function cn(e){const t={};const n=l(e,["config"]);n!=null&&ln(n,t);return t}function un(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["operations"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>Ot(e))));r(t,["batchJobs"],e)}return t}function pn(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["batchPredictionJobs"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>Rt(e))));r(t,["batchJobs"],e)}return t}function dn(e){const t={};const n=l(e,["functionCall"]);n!=null&&r(t,["functionCall"],n);const o=l(e,["codeExecutionResult"]);o!=null&&r(t,["codeExecutionResult"],o);const s=l(e,["executableCode"]);s!=null&&r(t,["executableCode"],s);const i=l(e,["fileData"]);i!=null&&r(t,["fileData"],zt(i));const a=l(e,["functionResponse"]);a!=null&&r(t,["functionResponse"],a);const c=l(e,["inlineData"]);c!=null&&r(t,["inlineData"],wt(c));const u=l(e,["text"]);u!=null&&r(t,["text"],u);const p=l(e,["thought"]);p!=null&&r(t,["thought"],p);const d=l(e,["thoughtSignature"]);d!=null&&r(t,["thoughtSignature"],d);const h=l(e,["videoMetadata"]);h!=null&&r(t,["videoMetadata"],h);return t}function hn(e){const t={};const n=l(e,["category"]);n!=null&&r(t,["category"],n);if(l(e,["method"])!==void 0)throw new Error("method parameter is not supported in Gemini API.");const o=l(e,["threshold"]);o!=null&&r(t,["threshold"],o);return t}function fn(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["functionDeclarations"],e)}if(l(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");const o=l(e,["googleSearchRetrieval"]);o!=null&&r(t,["googleSearchRetrieval"],o);const s=l(e,["computerUse"]);s!=null&&r(t,["computerUse"],s);const i=l(e,["fileSearch"]);i!=null&&r(t,["fileSearch"],i);const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);if(l(e,["enterpriseWebSearch"])!==void 0)throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");const c=l(e,["googleMaps"]);c!=null&&r(t,["googleMaps"],tn(c));const u=l(e,["googleSearch"]);u!=null&&r(t,["googleSearch"],nn(u));const p=l(e,["urlContext"]);p!=null&&r(t,["urlContext"],p);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */var mn;(function(e){e.PAGED_ITEM_BATCH_JOBS="batchJobs";e.PAGED_ITEM_MODELS="models";e.PAGED_ITEM_TUNING_JOBS="tuningJobs";e.PAGED_ITEM_FILES="files";e.PAGED_ITEM_CACHED_CONTENTS="cachedContents";e.PAGED_ITEM_FILE_SEARCH_STORES="fileSearchStores";e.PAGED_ITEM_DOCUMENTS="documents"})(mn||(mn={}));class Pager{constructor(e,t,n,o){this.pageInternal=[];this.paramsInternal={};this.requestInternal=t;this.init(e,n,o)}init(e,t,n){var o,s;this.nameInternal=e;this.pageInternal=t[this.nameInternal]||[];this.sdkHttpResponseInternal=t===null||t===void 0?void 0:t.sdkHttpResponse;this.idxInternal=0;let i={config:{}};i=n&&Object.keys(n).length!==0?typeof n==="object"?Object.assign({},n):n:{config:{}};i.config&&(i.config.pageToken=t.nextPageToken);this.paramsInternal=i;this.pageInternalSize=(s=(o=i.config)===null||o===void 0?void 0:o.pageSize)!==null&&s!==void 0?s:this.pageInternal.length}initNextPage(e){this.init(this.nameInternal,e,this.paramsInternal)}get page(){return this.pageInternal}get name(){return this.nameInternal}get pageSize(){return this.pageInternalSize}get sdkHttpResponse(){return this.sdkHttpResponseInternal}get params(){return this.paramsInternal}get pageLength(){return this.pageInternal.length}getItem(e){return this.pageInternal[e]}[Symbol.asyncIterator](){return{next:async()=>{if(this.idxInternal>=this.pageLength){if(!this.hasNextPage())return{value:void 0,done:true};await this.nextPage()}const e=this.getItem(this.idxInternal);this.idxInternal+=1;return{value:e,done:false}},return:async()=>({value:void 0,done:true})}}async nextPage(){if(!this.hasNextPage())throw new Error("No more pages to fetch.");const e=await this.requestInternal(this.params);this.initNextPage(e);return this.page}hasNextPage(){var e;return((e=this.params.config)===null||e===void 0?void 0:e.pageToken)!==void 0}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Batches extends BaseModule{constructor(e){super();this.apiClient=e;
/**
         * Create batch job.
         *
         * @param params - The parameters for create batch job request.
         * @return The created batch job.
         *
         * @example
         * ```ts
         * const response = await ai.batches.create({
         *   model: 'gemini-2.0-flash',
         *   src: {gcsUri: 'gs://bucket/path/to/file.jsonl', format: 'jsonl'},
         *   config: {
         *     dest: {gcsUri: 'gs://bucket/path/output/directory', format: 'jsonl'},
         *   }
         * });
         * console.log(response);
         * ```
         */this.create=async e=>{this.apiClient.isVertexAI()&&(e.config=this.formatDestination(e.src,e.config));return this.createInternal(e)};
/**
         * **Experimental** Creates an embedding batch job.
         *
         * @param params - The parameters for create embedding batch job request.
         * @return The created batch job.
         *
         * @example
         * ```ts
         * const response = await ai.batches.createEmbeddings({
         *   model: 'text-embedding-004',
         *   src: {fileName: 'files/my_embedding_input'},
         * });
         * console.log(response);
         * ```
         */this.createEmbeddings=async e=>{console.warn("batches.createEmbeddings() is experimental and may change without notice.");if(this.apiClient.isVertexAI())throw new Error("Vertex AI does not support batches.createEmbeddings.");return this.createEmbeddingsInternal(e)};
/**
         * Lists batch job configurations.
         *
         * @param params - The parameters for the list request.
         * @return The paginated results of the list of batch jobs.
         *
         * @example
         * ```ts
         * const batchJobs = await ai.batches.list({config: {'pageSize': 2}});
         * for await (const batchJob of batchJobs) {
         *   console.log(batchJob);
         * }
         * ```
         */this.list=async(e={})=>new Pager(mn.PAGED_ITEM_BATCH_JOBS,(e=>this.listInternal(e)),await this.listInternal(e),e)}createInlinedGenerateContentRequest(e){const t=Gt(this.apiClient,e);const n=t._url;const o=i("{model}:batchGenerateContent",n);const s=t.batch;const r=s.inputConfig;const l=r.requests;const a=l.requests;const c=[];for(const e of a){const t=Object.assign({},e);if(t.systemInstruction){const e=t.systemInstruction;delete t.systemInstruction;const n=t.request;n.systemInstruction=e;t.request=n}c.push(t)}l.requests=c;delete t.config;delete t._url;delete t._query;return{path:o,body:t}}getGcsUri(e){return typeof e==="string"?e.startsWith("gs://")?e:void 0:!Array.isArray(e)&&e.gcsUri&&e.gcsUri.length>0?e.gcsUri[0]:void 0}getBigqueryUri(e){return typeof e==="string"?e.startsWith("bq://")?e:void 0:Array.isArray(e)?void 0:e.bigqueryUri}formatDestination(e,t){const n=t?Object.assign({},t):{};const o=Date.now().toString();n.displayName||(n.displayName=`genaiBatchJob_${o}`);if(n.dest===void 0){const t=this.getGcsUri(e);const s=this.getBigqueryUri(e);if(t)t.endsWith(".jsonl")?n.dest=`${t.slice(0,-6)}/dest`:n.dest=`${t}_dest_${o}`;else{if(!s)throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");n.dest=`${s}_dest_${o}`}}return n}
/**
     * Internal method to create batch job.
     *
     * @param params - The parameters for create batch job request.
     * @return The created batch job.
     *
     */async createInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Ft(this.apiClient,e);l=i("batchPredictionJobs",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Rt(e);return t}))}{const t=Gt(this.apiClient,e);l=i("{model}:batchGenerateContent",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Ot(e);return t}))}}
/**
     * Internal method to create batch job.
     *
     * @param params - The parameters for create batch job request.
     * @return The created batch job.
     *
     */async createEmbeddingsInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Vt(this.apiClient,e);s=i("{model}:asyncBatchEmbedContent",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=Ot(e);return t}))}}
/**
     * Gets batch job configurations.
     *
     * @param params - The parameters for the get request.
     * @return The batch job.
     *
     * @example
     * ```ts
     * await ai.batches.get({name: '...'}); // The server-generated resource name.
     * ```
     */async get(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=en(this.apiClient,e);l=i("batchPredictionJobs/{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Rt(e);return t}))}{const t=Zt(this.apiClient,e);l=i("batches/{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Ot(e);return t}))}}
/**
     * Cancels a batch job.
     *
     * @param params - The parameters for the cancel request.
     * @return The empty response returned by the API.
     *
     * @example
     * ```ts
     * await ai.batches.cancel({name: '...'}); // The server-generated resource name.
     * ```
     */async cancel(e){var t,n,o,s;let r="";let l={};if(this.apiClient.isVertexAI()){const o=Dt(this.apiClient,e);r=i("batchPredictionJobs/{name}:cancel",o._url);l=o._query;delete o._url;delete o._query;await this.apiClient.request({path:r,queryParams:l,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal})}else{const t=Mt(this.apiClient,e);r=i("batches/{name}:cancel",t._url);l=t._query;delete t._url;delete t._query;await this.apiClient.request({path:r,queryParams:l,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal})}}async listInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=cn(e);l=i("batchPredictionJobs",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=pn(e);const n=new ListBatchJobsResponse;Object.assign(n,t);return n}))}{const t=an(e);l=i("batches",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=un(e);const n=new ListBatchJobsResponse;Object.assign(n,t);return n}))}}
/**
     * Deletes a batch job.
     *
     * @param params - The parameters for the delete request.
     * @return The empty response returned by the API.
     *
     * @example
     * ```ts
     * await ai.batches.delete({name: '...'}); // The server-generated resource name.
     * ```
     */async delete(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Bt(this.apiClient,e);l=i("batchPredictionJobs/{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Yt(e);return t}))}{const t=jt(this.apiClient,e);l=i("batches/{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"DELETE",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Jt(e);return t}))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function gn(e){const t={};const n=l(e,["data"]);n!=null&&r(t,["data"],n);if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function vn(e){const t={};const n=l(e,["parts"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>xn(e))));r(t,["parts"],e)}const o=l(e,["role"]);o!=null&&r(t,["role"],o);return t}function yn(e,t){const n={};const o=l(e,["ttl"]);t!==void 0&&o!=null&&r(t,["ttl"],o);const s=l(e,["expireTime"]);t!==void 0&&s!=null&&r(t,["expireTime"],s);const i=l(e,["displayName"]);t!==void 0&&i!=null&&r(t,["displayName"],i);const a=l(e,["contents"]);if(t!==void 0&&a!=null){let e=Xe(a);Array.isArray(e)&&(e=e.map((e=>vn(e))));r(t,["contents"],e)}const c=l(e,["systemInstruction"]);t!==void 0&&c!=null&&r(t,["systemInstruction"],vn($e(c)));const u=l(e,["tools"]);if(t!==void 0&&u!=null){let e=u;Array.isArray(e)&&(e=e.map((e=>Gn(e))));r(t,["tools"],e)}const p=l(e,["toolConfig"]);t!==void 0&&p!=null&&r(t,["toolConfig"],p);if(l(e,["kmsKeyName"])!==void 0)throw new Error("kmsKeyName parameter is not supported in Gemini API.");return n}function En(e,t){const n={};const o=l(e,["ttl"]);t!==void 0&&o!=null&&r(t,["ttl"],o);const s=l(e,["expireTime"]);t!==void 0&&s!=null&&r(t,["expireTime"],s);const i=l(e,["displayName"]);t!==void 0&&i!=null&&r(t,["displayName"],i);const a=l(e,["contents"]);if(t!==void 0&&a!=null){let e=Xe(a);Array.isArray(e)&&(e=e.map((e=>e)));r(t,["contents"],e)}const c=l(e,["systemInstruction"]);t!==void 0&&c!=null&&r(t,["systemInstruction"],$e(c));const u=l(e,["tools"]);if(t!==void 0&&u!=null){let e=u;Array.isArray(e)&&(e=e.map((e=>Fn(e))));r(t,["tools"],e)}const p=l(e,["toolConfig"]);t!==void 0&&p!=null&&r(t,["toolConfig"],p);const d=l(e,["kmsKeyName"]);t!==void 0&&d!=null&&r(t,["encryption_spec","kmsKeyName"],d);return n}function _n(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["model"],Ge(e,o));const s=l(t,["config"]);s!=null&&yn(s,n);return n}function In(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["model"],Ge(e,o));const s=l(t,["config"]);s!=null&&En(s,n);return n}function Tn(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],rt(e,o));return n}function Cn(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],rt(e,o));return n}function An(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}function Sn(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}function On(e){const t={};if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const n=l(e,["fileUri"]);n!=null&&r(t,["fileUri"],n);const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function Rn(e){const t={};if(l(e,["behavior"])!==void 0)throw new Error("behavior parameter is not supported in Vertex AI.");const n=l(e,["description"]);n!=null&&r(t,["description"],n);const o=l(e,["name"]);o!=null&&r(t,["name"],o);const s=l(e,["parameters"]);s!=null&&r(t,["parameters"],s);const i=l(e,["parametersJsonSchema"]);i!=null&&r(t,["parametersJsonSchema"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],a);const c=l(e,["responseJsonSchema"]);c!=null&&r(t,["responseJsonSchema"],c);return t}function bn(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],rt(e,o));return n}function Nn(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],rt(e,o));return n}function Pn(e){const t={};if(l(e,["authConfig"])!==void 0)throw new Error("authConfig parameter is not supported in Gemini API.");const n=l(e,["enableWidget"]);n!=null&&r(t,["enableWidget"],n);return t}function wn(e){const t={};if(l(e,["excludeDomains"])!==void 0)throw new Error("excludeDomains parameter is not supported in Gemini API.");if(l(e,["blockingConfidence"])!==void 0)throw new Error("blockingConfidence parameter is not supported in Gemini API.");const n=l(e,["timeRangeFilter"]);n!=null&&r(t,["timeRangeFilter"],n);return t}function Mn(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);return n}function Dn(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);return n}function Un(e){const t={};const n=l(e,["config"]);n!=null&&Mn(n,t);return t}function kn(e){const t={};const n=l(e,["config"]);n!=null&&Dn(n,t);return t}function Ln(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["cachedContents"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["cachedContents"],e)}return t}function qn(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["cachedContents"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["cachedContents"],e)}return t}function xn(e){const t={};const n=l(e,["functionCall"]);n!=null&&r(t,["functionCall"],n);const o=l(e,["codeExecutionResult"]);o!=null&&r(t,["codeExecutionResult"],o);const s=l(e,["executableCode"]);s!=null&&r(t,["executableCode"],s);const i=l(e,["fileData"]);i!=null&&r(t,["fileData"],On(i));const a=l(e,["functionResponse"]);a!=null&&r(t,["functionResponse"],a);const c=l(e,["inlineData"]);c!=null&&r(t,["inlineData"],gn(c));const u=l(e,["text"]);u!=null&&r(t,["text"],u);const p=l(e,["thought"]);p!=null&&r(t,["thought"],p);const d=l(e,["thoughtSignature"]);d!=null&&r(t,["thoughtSignature"],d);const h=l(e,["videoMetadata"]);h!=null&&r(t,["videoMetadata"],h);return t}function Gn(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["functionDeclarations"],e)}if(l(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");const o=l(e,["googleSearchRetrieval"]);o!=null&&r(t,["googleSearchRetrieval"],o);const s=l(e,["computerUse"]);s!=null&&r(t,["computerUse"],s);const i=l(e,["fileSearch"]);i!=null&&r(t,["fileSearch"],i);const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);if(l(e,["enterpriseWebSearch"])!==void 0)throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");const c=l(e,["googleMaps"]);c!=null&&r(t,["googleMaps"],Pn(c));const u=l(e,["googleSearch"]);u!=null&&r(t,["googleSearch"],wn(u));const p=l(e,["urlContext"]);p!=null&&r(t,["urlContext"],p);return t}function Fn(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>Rn(e))));r(t,["functionDeclarations"],e)}const o=l(e,["retrieval"]);o!=null&&r(t,["retrieval"],o);const s=l(e,["googleSearchRetrieval"]);s!=null&&r(t,["googleSearchRetrieval"],s);const i=l(e,["computerUse"]);i!=null&&r(t,["computerUse"],i);if(l(e,["fileSearch"])!==void 0)throw new Error("fileSearch parameter is not supported in Vertex AI.");const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);const c=l(e,["enterpriseWebSearch"]);c!=null&&r(t,["enterpriseWebSearch"],c);const u=l(e,["googleMaps"]);u!=null&&r(t,["googleMaps"],u);const p=l(e,["googleSearch"]);p!=null&&r(t,["googleSearch"],p);const d=l(e,["urlContext"]);d!=null&&r(t,["urlContext"],d);return t}function Hn(e,t){const n={};const o=l(e,["ttl"]);t!==void 0&&o!=null&&r(t,["ttl"],o);const s=l(e,["expireTime"]);t!==void 0&&s!=null&&r(t,["expireTime"],s);return n}function Vn(e,t){const n={};const o=l(e,["ttl"]);t!==void 0&&o!=null&&r(t,["ttl"],o);const s=l(e,["expireTime"]);t!==void 0&&s!=null&&r(t,["expireTime"],s);return n}function jn(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],rt(e,o));const s=l(t,["config"]);s!=null&&Hn(s,n);return n}function Bn(e,t){const n={};const o=l(t,["name"]);o!=null&&r(n,["_url","name"],rt(e,o));const s=l(t,["config"]);s!=null&&Vn(s,n);return n}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Caches extends BaseModule{constructor(e){super();this.apiClient=e;
/**
         * Lists cached content configurations.
         *
         * @param params - The parameters for the list request.
         * @return The paginated results of the list of cached contents.
         *
         * @example
         * ```ts
         * const cachedContents = await ai.caches.list({config: {'pageSize': 2}});
         * for await (const cachedContent of cachedContents) {
         *   console.log(cachedContent);
         * }
         * ```
         */this.list=async(e={})=>new Pager(mn.PAGED_ITEM_CACHED_CONTENTS,(e=>this.listInternal(e)),await this.listInternal(e),e)}
/**
     * Creates a cached contents resource.
     *
     * @remarks
     * Context caching is only supported for specific models. See [Gemini
     * Developer API reference](https://ai.google.dev/gemini-api/docs/caching?lang=node/context-cac)
     * and [Vertex AI reference](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview#supported_models)
     * for more information.
     *
     * @param params - The parameters for the create request.
     * @return The created cached content.
     *
     * @example
     * ```ts
     * const contents = ...; // Initialize the content to cache.
     * const response = await ai.caches.create({
     *   model: 'gemini-2.0-flash-001',
     *   config: {
     *    'contents': contents,
     *    'displayName': 'test cache',
     *    'systemInstruction': 'What is the sum of the two pdfs?',
     *    'ttl': '86400s',
     *  }
     * });
     * ```
     */async create(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=In(this.apiClient,e);l=i("cachedContents",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>e))}{const t=_n(this.apiClient,e);l=i("cachedContents",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>e))}}
/**
     * Gets cached content configurations.
     *
     * @param params - The parameters for the get request.
     * @return The cached content.
     *
     * @example
     * ```ts
     * await ai.caches.get({name: '...'}); // The server-generated resource name.
     * ```
     */async get(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Nn(this.apiClient,e);l=i("{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>e))}{const t=bn(this.apiClient,e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>e))}}
/**
     * Deletes cached content.
     *
     * @param params - The parameters for the delete request.
     * @return The empty response returned by the API.
     *
     * @example
     * ```ts
     * await ai.caches.delete({name: '...'}); // The server-generated resource name.
     * ```
     */async delete(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Cn(this.apiClient,e);l=i("{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Sn(e);const n=new DeleteCachedContentResponse;Object.assign(n,t);return n}))}{const t=Tn(this.apiClient,e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"DELETE",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=An(e);const n=new DeleteCachedContentResponse;Object.assign(n,t);return n}))}}
/**
     * Updates cached content configurations.
     *
     * @param params - The parameters for the update request.
     * @return The updated cached content.
     *
     * @example
     * ```ts
     * const response = await ai.caches.update({
     *   name: '...',  // The server-generated resource name.
     *   config: {'ttl': '7600s'}
     * });
     * ```
     */async update(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Bn(this.apiClient,e);l=i("{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"PATCH",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>e))}{const t=jn(this.apiClient,e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"PATCH",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>e))}}async listInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=kn(e);l=i("cachedContents",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=qn(e);const n=new ListCachedContentsResponse;Object.assign(n,t);return n}))}{const t=Un(e);l=i("cachedContents",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Ln(e);const n=new ListCachedContentsResponse;Object.assign(n,t);return n}))}}}function Jn(e){var t=typeof Symbol==="function"&&Symbol.iterator,n=t&&e[t],o=0;if(n)return n.call(e);if(e&&typeof e.length==="number")return{next:function(){e&&o>=e.length&&(e=void 0);return{value:e&&e[o++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function Yn(e){return this instanceof Yn?(this.v=e,this):new Yn(e)}function Wn(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var o,s=n.apply(e,t||[]),i=[];return o=Object.create((typeof AsyncIterator==="function"?AsyncIterator:Object).prototype),l("next"),l("throw"),l("return",r),o[Symbol.asyncIterator]=function(){return this},o;function r(e){return function(t){return Promise.resolve(t).then(e,p)}}function l(e,t){if(s[e]){o[e]=function(t){return new Promise((function(n,o){i.push([e,t,n,o])>1||a(e,t)}))};t&&(o[e]=t(o[e]))}}function a(e,t){try{c(s[e](t))}catch(e){d(i[0][3],e)}}function c(e){e.value instanceof Yn?Promise.resolve(e.value.v).then(u,p):d(i[0][2],e)}function u(e){a("next",e)}function p(e){a("throw",e)}function d(e,t){(e(t),i.shift(),i.length)&&a(i[0][0],i[0][1])}}function Kn(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t,n=e[Symbol.asyncIterator];return n?n.call(e):(e=typeof Jn==="function"?Jn(e):e[Symbol.iterator](),t={},o("next"),o("throw"),o("return"),t[Symbol.asyncIterator]=function(){return this},t);function o(n){t[n]=e[n]&&function(t){return new Promise((function(o,i){t=e[n](t),s(o,i,t.done,t.value)}))}}function s(e,t,n,o){Promise.resolve(o).then((function(t){e({value:t,done:n})}),t)}}typeof SuppressedError==="function"?SuppressedError:function(e,t,n){var o=new Error(n);return o.name="SuppressedError",o.error=e,o.suppressed=t,o};
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function $n(e){var t;if(e.candidates==void 0||e.candidates.length===0)return false;const n=(t=e.candidates[0])===null||t===void 0?void 0:t.content;return n!==void 0&&zn(n)}function zn(e){if(e.parts===void 0||e.parts.length===0)return false;for(const t of e.parts)if(t===void 0||Object.keys(t).length===0)return false;return true}function Xn(e){if(e.length!==0)for(const t of e)if(t.role!=="user"&&t.role!=="model")throw new Error(`Role must be user or model, but got ${t.role}.`)}function Qn(e){if(e===void 0||e.length===0)return[];const t=[];const n=e.length;let o=0;while(o<n)if(e[o].role==="user"){t.push(e[o]);o++}else{const s=[];let i=true;while(o<n&&e[o].role==="model"){s.push(e[o]);i&&!zn(e[o])&&(i=false);o++}i?t.push(...s):t.pop()}return t}class Chats{constructor(e,t){this.modelsModule=e;this.apiClient=t}
/**
     * Creates a new chat session.
     *
     * @remarks
     * The config in the params will be used for all requests within the chat
     * session unless overridden by a per-request `config` in
     * @see {@link types.SendMessageParameters#config}.
     *
     * @param params - Parameters for creating a chat session.
     * @returns A new chat session.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({
     *   model: 'gemini-2.0-flash'
     *   config: {
     *     temperature: 0.5,
     *     maxOutputTokens: 1024,
     *   }
     * });
     * ```
     */create(e){return new Chat(this.apiClient,this.modelsModule,e.model,e.config,structuredClone(e.history))}}class Chat{constructor(e,t,n,o={},s=[]){this.apiClient=e;this.modelsModule=t;this.model=n;this.config=o;this.history=s;this.sendPromise=Promise.resolve();Xn(s)}
/**
     * Sends a message to the model and returns the response.
     *
     * @remarks
     * This method will wait for the previous message to be processed before
     * sending the next message.
     *
     * @see {@link Chat#sendMessageStream} for streaming method.
     * @param params - parameters for sending messages within a chat session.
     * @returns The model's response.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
     * const response = await chat.sendMessage({
     *   message: 'Why is the sky blue?'
     * });
     * console.log(response.text);
     * ```
     */async sendMessage(e){var t;await this.sendPromise;const n=$e(e.message);const o=this.modelsModule.generateContent({model:this.model,contents:this.getHistory(true).concat(n),config:(t=e.config)!==null&&t!==void 0?t:this.config});this.sendPromise=(async()=>{var e,t,s;const i=await o;const r=(t=(e=i.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content;const l=i.automaticFunctionCallingHistory;const a=this.getHistory(true).length;let c=[];l!=null&&(c=(s=l.slice(a))!==null&&s!==void 0?s:[]);const u=r?[r]:[];this.recordHistory(n,u,c)})();await this.sendPromise.catch((()=>{this.sendPromise=Promise.resolve()}));return o}
/**
     * Sends a message to the model and returns the response in chunks.
     *
     * @remarks
     * This method will wait for the previous message to be processed before
     * sending the next message.
     *
     * @see {@link Chat#sendMessage} for non-streaming method.
     * @param params - parameters for sending the message.
     * @return The model's response.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
     * const response = await chat.sendMessageStream({
     *   message: 'Why is the sky blue?'
     * });
     * for await (const chunk of response) {
     *   console.log(chunk.text);
     * }
     * ```
     */async sendMessageStream(e){var t;await this.sendPromise;const n=$e(e.message);const o=this.modelsModule.generateContentStream({model:this.model,contents:this.getHistory(true).concat(n),config:(t=e.config)!==null&&t!==void 0?t:this.config});this.sendPromise=o.then((()=>{})).catch((()=>{}));const s=await o;const i=this.processStreamResponse(s,n);return i}
/**
     * Returns the chat history.
     *
     * @remarks
     * The history is a list of contents alternating between user and model.
     *
     * There are two types of history:
     * - The `curated history` contains only the valid turns between user and
     * model, which will be included in the subsequent requests sent to the model.
     * - The `comprehensive history` contains all turns, including invalid or
     *   empty model outputs, providing a complete record of the history.
     *
     * The history is updated after receiving the response from the model,
     * for streaming response, it means receiving the last chunk of the response.
     *
     * The `comprehensive history` is returned by default. To get the `curated
     * history`, set the `curated` parameter to `true`.
     *
     * @param curated - whether to return the curated history or the comprehensive
     *     history.
     * @return History contents alternating between user and model for the entire
     *     chat session.
     */getHistory(e=false){const t=e?Qn(this.history):this.history;return structuredClone(t)}processStreamResponse(e,t){var n,o;return Wn(this,arguments,(function*(){var s,i,r,l;const a=[];try{for(var c,u=true,p=Kn(e);c=yield Yn(p.next()),s=c.done,!s;u=true){l=c.value;u=false;const e=l;if($n(e)){const t=(o=(n=e.candidates)===null||n===void 0?void 0:n[0])===null||o===void 0?void 0:o.content;t!==void 0&&a.push(t)}yield yield Yn(e)}}catch(e){i={error:e}}finally{try{u||s||!(r=p.return)||(yield Yn(r.call(p)))}finally{if(i)throw i.error}}this.recordHistory(t,a)}))}recordHistory(e,t,n){let o=[];t.length>0&&t.every((e=>e.role!==void 0))?o=t:o.push({role:"model",parts:[]});n&&n.length>0?this.history.push(...Qn(n)):this.history.push(e);this.history.push(...o)}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class ApiError extends Error{constructor(e){super(e.message);this.name="ApiError";this.status=e.status;Object.setPrototypeOf(this,ApiError.prototype)}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Zn(e){const t={};const n=l(e,["file"]);n!=null&&r(t,["file"],n);return t}function eo(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}function to(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["_url","file"],dt(n));return t}function no(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}function oo(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["_url","file"],dt(n));return t}function so(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);return n}function io(e){const t={};const n=l(e,["config"]);n!=null&&so(n,t);return t}function ro(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["files"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["files"],e)}return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Files extends BaseModule{constructor(e){super();this.apiClient=e;
/**
         * Lists all current project files from the service.
         *
         * @param params - The parameters for the list request
         * @return The paginated results of the list of files
         *
         * @example
         * The following code prints the names of all files from the service, the
         * size of each page is 10.
         *
         * ```ts
         * const listResponse = await ai.files.list({config: {'pageSize': 10}});
         * for await (const file of listResponse) {
         *   console.log(file.name);
         * }
         * ```
         */this.list=async(e={})=>new Pager(mn.PAGED_ITEM_FILES,(e=>this.listInternal(e)),await this.listInternal(e),e)}
/**
     * Uploads a file asynchronously to the Gemini API.
     * This method is not available in Vertex AI.
     * Supported upload sources:
     * - Node.js: File path (string) or Blob object.
     * - Browser: Blob object (e.g., File).
     *
     * @remarks
     * The `mimeType` can be specified in the `config` parameter. If omitted:
     *  - For file path (string) inputs, the `mimeType` will be inferred from the
     *     file extension.
     *  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
     *     property.
     * Somex eamples for file extension to mimeType mapping:
     * .txt -> text/plain
     * .json -> application/json
     * .jpg  -> image/jpeg
     * .png -> image/png
     * .mp3 -> audio/mpeg
     * .mp4 -> video/mp4
     *
     * This section can contain multiple paragraphs and code examples.
     *
     * @param params - Optional parameters specified in the
     *        `types.UploadFileParameters` interface.
     *         @see {@link types.UploadFileParameters#config} for the optional
     *         config in the parameters.
     * @return A promise that resolves to a `types.File` object.
     * @throws An error if called on a Vertex AI client.
     * @throws An error if the `mimeType` is not provided and can not be inferred,
     * the `mimeType` can be provided in the `params.config` parameter.
     * @throws An error occurs if a suitable upload location cannot be established.
     *
     * @example
     * The following code uploads a file to Gemini API.
     *
     * ```ts
     * const file = await ai.files.upload({file: 'file.txt', config: {
     *   mimeType: 'text/plain',
     * }});
     * console.log(file.name);
     * ```
     */async upload(e){if(this.apiClient.isVertexAI())throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");return this.apiClient.uploadFile(e.file,e.config).then((e=>e))}
/**
     * Downloads a remotely stored file asynchronously to a location specified in
     * the `params` object. This method only works on Node environment, to
     * download files in the browser, use a browser compliant method like an <a>
     * tag.
     *
     * @param params - The parameters for the download request.
     *
     * @example
     * The following code downloads an example file named "files/mehozpxf877d" as
     * "file.txt".
     *
     * ```ts
     * await ai.files.download({file: file.name, downloadPath: 'file.txt'});
     * ```
     */async download(e){await this.apiClient.downloadFile(e)}async listInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=io(e);s=i("files",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=ro(e);const n=new ListFilesResponse;Object.assign(n,t);return n}))}}async createInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Zn(e);s=i("upload/v1beta/files",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=eo(e);const n=new CreateFileResponse;Object.assign(n,t);return n}))}}
/**
     * Retrieves the file information from the service.
     *
     * @param params - The parameters for the get request
     * @return The Promise that resolves to the types.File object requested.
     *
     * @example
     * ```ts
     * const config: GetFileParameters = {
     *   name: fileName,
     * };
     * file = await ai.files.get(config);
     * console.log(file.name);
     * ```
     */async get(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=oo(e);s=i("files/{file}",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>e))}}
/**
     * Deletes a remotely stored file.
     *
     * @param params - The parameters for the delete request.
     * @return The DeleteFileResponse, the response for the delete method.
     *
     * @example
     * The following code deletes an example file named "files/mehozpxf877d".
     *
     * ```ts
     * await ai.files.delete({name: file.name});
     * ```
     */async delete(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=to(e);s=i("files/{file}",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=no(e);const n=new DeleteFileResponse;Object.assign(n,t);return n}))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function lo(e){const t={};const n=l(e,["data"]);n!=null&&r(t,["data"],n);if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function ao(e){const t={};const n=l(e,["parts"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>Ao(e))));r(t,["parts"],e)}const o=l(e,["role"]);o!=null&&r(t,["role"],o);return t}function co(e){const t={};if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const n=l(e,["fileUri"]);n!=null&&r(t,["fileUri"],n);const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function uo(e){const t={};if(l(e,["behavior"])!==void 0)throw new Error("behavior parameter is not supported in Vertex AI.");const n=l(e,["description"]);n!=null&&r(t,["description"],n);const o=l(e,["name"]);o!=null&&r(t,["name"],o);const s=l(e,["parameters"]);s!=null&&r(t,["parameters"],s);const i=l(e,["parametersJsonSchema"]);i!=null&&r(t,["parametersJsonSchema"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],a);const c=l(e,["responseJsonSchema"]);c!=null&&r(t,["responseJsonSchema"],c);return t}function po(e){const t={};const n=l(e,["modelSelectionConfig"]);n!=null&&r(t,["modelConfig"],n);const o=l(e,["responseJsonSchema"]);o!=null&&r(t,["responseJsonSchema"],o);const s=l(e,["audioTimestamp"]);s!=null&&r(t,["audioTimestamp"],s);const i=l(e,["candidateCount"]);i!=null&&r(t,["candidateCount"],i);const a=l(e,["enableAffectiveDialog"]);a!=null&&r(t,["enableAffectiveDialog"],a);const c=l(e,["frequencyPenalty"]);c!=null&&r(t,["frequencyPenalty"],c);const u=l(e,["logprobs"]);u!=null&&r(t,["logprobs"],u);const p=l(e,["maxOutputTokens"]);p!=null&&r(t,["maxOutputTokens"],p);const d=l(e,["mediaResolution"]);d!=null&&r(t,["mediaResolution"],d);const h=l(e,["presencePenalty"]);h!=null&&r(t,["presencePenalty"],h);const f=l(e,["responseLogprobs"]);f!=null&&r(t,["responseLogprobs"],f);const m=l(e,["responseMimeType"]);m!=null&&r(t,["responseMimeType"],m);const g=l(e,["responseModalities"]);g!=null&&r(t,["responseModalities"],g);const v=l(e,["responseSchema"]);v!=null&&r(t,["responseSchema"],v);const y=l(e,["routingConfig"]);y!=null&&r(t,["routingConfig"],y);const E=l(e,["seed"]);E!=null&&r(t,["seed"],E);const _=l(e,["speechConfig"]);_!=null&&r(t,["speechConfig"],Oo(_));const I=l(e,["stopSequences"]);I!=null&&r(t,["stopSequences"],I);const T=l(e,["temperature"]);T!=null&&r(t,["temperature"],T);const C=l(e,["thinkingConfig"]);C!=null&&r(t,["thinkingConfig"],C);const A=l(e,["topK"]);A!=null&&r(t,["topK"],A);const S=l(e,["topP"]);S!=null&&r(t,["topP"],S);if(l(e,["enableEnhancedCivicAnswers"])!==void 0)throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");return t}function ho(e){const t={};if(l(e,["authConfig"])!==void 0)throw new Error("authConfig parameter is not supported in Gemini API.");const n=l(e,["enableWidget"]);n!=null&&r(t,["enableWidget"],n);return t}function fo(e){const t={};if(l(e,["excludeDomains"])!==void 0)throw new Error("excludeDomains parameter is not supported in Gemini API.");if(l(e,["blockingConfidence"])!==void 0)throw new Error("blockingConfidence parameter is not supported in Gemini API.");const n=l(e,["timeRangeFilter"]);n!=null&&r(t,["timeRangeFilter"],n);return t}function mo(e,t){const n={};const o=l(e,["generationConfig"]);t!==void 0&&o!=null&&r(t,["setup","generationConfig"],o);const s=l(e,["responseModalities"]);t!==void 0&&s!=null&&r(t,["setup","generationConfig","responseModalities"],s);const i=l(e,["temperature"]);t!==void 0&&i!=null&&r(t,["setup","generationConfig","temperature"],i);const a=l(e,["topP"]);t!==void 0&&a!=null&&r(t,["setup","generationConfig","topP"],a);const c=l(e,["topK"]);t!==void 0&&c!=null&&r(t,["setup","generationConfig","topK"],c);const u=l(e,["maxOutputTokens"]);t!==void 0&&u!=null&&r(t,["setup","generationConfig","maxOutputTokens"],u);const p=l(e,["mediaResolution"]);t!==void 0&&p!=null&&r(t,["setup","generationConfig","mediaResolution"],p);const d=l(e,["seed"]);t!==void 0&&d!=null&&r(t,["setup","generationConfig","seed"],d);const h=l(e,["speechConfig"]);t!==void 0&&h!=null&&r(t,["setup","generationConfig","speechConfig"],nt(h));const f=l(e,["thinkingConfig"]);t!==void 0&&f!=null&&r(t,["setup","generationConfig","thinkingConfig"],f);const m=l(e,["enableAffectiveDialog"]);t!==void 0&&m!=null&&r(t,["setup","generationConfig","enableAffectiveDialog"],m);const g=l(e,["systemInstruction"]);t!==void 0&&g!=null&&r(t,["setup","systemInstruction"],ao($e(g)));const v=l(e,["tools"]);if(t!==void 0&&v!=null){let e=st(v);Array.isArray(e)&&(e=e.map((e=>Ro(ot(e)))));r(t,["setup","tools"],e)}const y=l(e,["sessionResumption"]);t!==void 0&&y!=null&&r(t,["setup","sessionResumption"],So(y));const E=l(e,["inputAudioTranscription"]);t!==void 0&&E!=null&&r(t,["setup","inputAudioTranscription"],E);const _=l(e,["outputAudioTranscription"]);t!==void 0&&_!=null&&r(t,["setup","outputAudioTranscription"],_);const I=l(e,["realtimeInputConfig"]);t!==void 0&&I!=null&&r(t,["setup","realtimeInputConfig"],I);const T=l(e,["contextWindowCompression"]);t!==void 0&&T!=null&&r(t,["setup","contextWindowCompression"],T);const C=l(e,["proactivity"]);t!==void 0&&C!=null&&r(t,["setup","proactivity"],C);return n}function go(e,t){const n={};const o=l(e,["generationConfig"]);t!==void 0&&o!=null&&r(t,["setup","generationConfig"],po(o));const s=l(e,["responseModalities"]);t!==void 0&&s!=null&&r(t,["setup","generationConfig","responseModalities"],s);const i=l(e,["temperature"]);t!==void 0&&i!=null&&r(t,["setup","generationConfig","temperature"],i);const a=l(e,["topP"]);t!==void 0&&a!=null&&r(t,["setup","generationConfig","topP"],a);const c=l(e,["topK"]);t!==void 0&&c!=null&&r(t,["setup","generationConfig","topK"],c);const u=l(e,["maxOutputTokens"]);t!==void 0&&u!=null&&r(t,["setup","generationConfig","maxOutputTokens"],u);const p=l(e,["mediaResolution"]);t!==void 0&&p!=null&&r(t,["setup","generationConfig","mediaResolution"],p);const d=l(e,["seed"]);t!==void 0&&d!=null&&r(t,["setup","generationConfig","seed"],d);const h=l(e,["speechConfig"]);t!==void 0&&h!=null&&r(t,["setup","generationConfig","speechConfig"],Oo(nt(h)));const f=l(e,["thinkingConfig"]);t!==void 0&&f!=null&&r(t,["setup","generationConfig","thinkingConfig"],f);const m=l(e,["enableAffectiveDialog"]);t!==void 0&&m!=null&&r(t,["setup","generationConfig","enableAffectiveDialog"],m);const g=l(e,["systemInstruction"]);t!==void 0&&g!=null&&r(t,["setup","systemInstruction"],$e(g));const v=l(e,["tools"]);if(t!==void 0&&v!=null){let e=st(v);Array.isArray(e)&&(e=e.map((e=>bo(ot(e)))));r(t,["setup","tools"],e)}const y=l(e,["sessionResumption"]);t!==void 0&&y!=null&&r(t,["setup","sessionResumption"],y);const E=l(e,["inputAudioTranscription"]);t!==void 0&&E!=null&&r(t,["setup","inputAudioTranscription"],E);const _=l(e,["outputAudioTranscription"]);t!==void 0&&_!=null&&r(t,["setup","outputAudioTranscription"],_);const I=l(e,["realtimeInputConfig"]);t!==void 0&&I!=null&&r(t,["setup","realtimeInputConfig"],I);const T=l(e,["contextWindowCompression"]);t!==void 0&&T!=null&&r(t,["setup","contextWindowCompression"],T);const C=l(e,["proactivity"]);t!==void 0&&C!=null&&r(t,["setup","proactivity"],C);return n}function vo(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["setup","model"],xe(e,o));const s=l(t,["config"]);s!=null&&r(n,["config"],mo(s,n));return n}function yo(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["setup","model"],xe(e,o));const s=l(t,["config"]);s!=null&&r(n,["config"],go(s,n));return n}function Eo(e){const t={};const n=l(e,["musicGenerationConfig"]);n!=null&&r(t,["musicGenerationConfig"],n);return t}function _o(e){const t={};const n=l(e,["weightedPrompts"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["weightedPrompts"],e)}return t}function Io(e){const t={};const n=l(e,["media"]);if(n!=null){let e=Fe(n);Array.isArray(e)&&(e=e.map((e=>lo(e))));r(t,["mediaChunks"],e)}const o=l(e,["audio"]);o!=null&&r(t,["audio"],lo(je(o)));const s=l(e,["audioStreamEnd"]);s!=null&&r(t,["audioStreamEnd"],s);const i=l(e,["video"]);i!=null&&r(t,["video"],lo(Ve(i)));const a=l(e,["text"]);a!=null&&r(t,["text"],a);const c=l(e,["activityStart"]);c!=null&&r(t,["activityStart"],c);const u=l(e,["activityEnd"]);u!=null&&r(t,["activityEnd"],u);return t}function To(e){const t={};const n=l(e,["media"]);if(n!=null){let e=Fe(n);Array.isArray(e)&&(e=e.map((e=>e)));r(t,["mediaChunks"],e)}const o=l(e,["audio"]);o!=null&&r(t,["audio"],je(o));const s=l(e,["audioStreamEnd"]);s!=null&&r(t,["audioStreamEnd"],s);const i=l(e,["video"]);i!=null&&r(t,["video"],Ve(i));const a=l(e,["text"]);a!=null&&r(t,["text"],a);const c=l(e,["activityStart"]);c!=null&&r(t,["activityStart"],c);const u=l(e,["activityEnd"]);u!=null&&r(t,["activityEnd"],u);return t}function Co(e){const t={};const n=l(e,["setupComplete"]);n!=null&&r(t,["setupComplete"],n);const o=l(e,["serverContent"]);o!=null&&r(t,["serverContent"],o);const s=l(e,["toolCall"]);s!=null&&r(t,["toolCall"],s);const i=l(e,["toolCallCancellation"]);i!=null&&r(t,["toolCallCancellation"],i);const a=l(e,["usageMetadata"]);a!=null&&r(t,["usageMetadata"],No(a));const c=l(e,["goAway"]);c!=null&&r(t,["goAway"],c);const u=l(e,["sessionResumptionUpdate"]);u!=null&&r(t,["sessionResumptionUpdate"],u);return t}function Ao(e){const t={};const n=l(e,["functionCall"]);n!=null&&r(t,["functionCall"],n);const o=l(e,["codeExecutionResult"]);o!=null&&r(t,["codeExecutionResult"],o);const s=l(e,["executableCode"]);s!=null&&r(t,["executableCode"],s);const i=l(e,["fileData"]);i!=null&&r(t,["fileData"],co(i));const a=l(e,["functionResponse"]);a!=null&&r(t,["functionResponse"],a);const c=l(e,["inlineData"]);c!=null&&r(t,["inlineData"],lo(c));const u=l(e,["text"]);u!=null&&r(t,["text"],u);const p=l(e,["thought"]);p!=null&&r(t,["thought"],p);const d=l(e,["thoughtSignature"]);d!=null&&r(t,["thoughtSignature"],d);const h=l(e,["videoMetadata"]);h!=null&&r(t,["videoMetadata"],h);return t}function So(e){const t={};const n=l(e,["handle"]);n!=null&&r(t,["handle"],n);if(l(e,["transparent"])!==void 0)throw new Error("transparent parameter is not supported in Gemini API.");return t}function Oo(e){const t={};const n=l(e,["languageCode"]);n!=null&&r(t,["languageCode"],n);const o=l(e,["voiceConfig"]);o!=null&&r(t,["voiceConfig"],o);if(l(e,["multiSpeakerVoiceConfig"])!==void 0)throw new Error("multiSpeakerVoiceConfig parameter is not supported in Vertex AI.");return t}function Ro(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["functionDeclarations"],e)}if(l(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");const o=l(e,["googleSearchRetrieval"]);o!=null&&r(t,["googleSearchRetrieval"],o);const s=l(e,["computerUse"]);s!=null&&r(t,["computerUse"],s);const i=l(e,["fileSearch"]);i!=null&&r(t,["fileSearch"],i);const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);if(l(e,["enterpriseWebSearch"])!==void 0)throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");const c=l(e,["googleMaps"]);c!=null&&r(t,["googleMaps"],ho(c));const u=l(e,["googleSearch"]);u!=null&&r(t,["googleSearch"],fo(u));const p=l(e,["urlContext"]);p!=null&&r(t,["urlContext"],p);return t}function bo(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>uo(e))));r(t,["functionDeclarations"],e)}const o=l(e,["retrieval"]);o!=null&&r(t,["retrieval"],o);const s=l(e,["googleSearchRetrieval"]);s!=null&&r(t,["googleSearchRetrieval"],s);const i=l(e,["computerUse"]);i!=null&&r(t,["computerUse"],i);if(l(e,["fileSearch"])!==void 0)throw new Error("fileSearch parameter is not supported in Vertex AI.");const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);const c=l(e,["enterpriseWebSearch"]);c!=null&&r(t,["enterpriseWebSearch"],c);const u=l(e,["googleMaps"]);u!=null&&r(t,["googleMaps"],u);const p=l(e,["googleSearch"]);p!=null&&r(t,["googleSearch"],p);const d=l(e,["urlContext"]);d!=null&&r(t,["urlContext"],d);return t}function No(e){const t={};const n=l(e,["promptTokenCount"]);n!=null&&r(t,["promptTokenCount"],n);const o=l(e,["cachedContentTokenCount"]);o!=null&&r(t,["cachedContentTokenCount"],o);const s=l(e,["candidatesTokenCount"]);s!=null&&r(t,["responseTokenCount"],s);const i=l(e,["toolUsePromptTokenCount"]);i!=null&&r(t,["toolUsePromptTokenCount"],i);const a=l(e,["thoughtsTokenCount"]);a!=null&&r(t,["thoughtsTokenCount"],a);const c=l(e,["totalTokenCount"]);c!=null&&r(t,["totalTokenCount"],c);const u=l(e,["promptTokensDetails"]);if(u!=null){let e=u;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["promptTokensDetails"],e)}const p=l(e,["cacheTokensDetails"]);if(p!=null){let e=p;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["cacheTokensDetails"],e)}const d=l(e,["candidatesTokensDetails"]);if(d!=null){let e=d;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["responseTokensDetails"],e)}const h=l(e,["toolUsePromptTokensDetails"]);if(h!=null){let e=h;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["toolUsePromptTokensDetails"],e)}const f=l(e,["trafficType"]);f!=null&&r(t,["trafficType"],f);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Po(e){const t={};const n=l(e,["data"]);n!=null&&r(t,["data"],n);if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function wo(e){const t={};const n=l(e,["content"]);n!=null&&r(t,["content"],n);const o=l(e,["citationMetadata"]);o!=null&&r(t,["citationMetadata"],Mo(o));const s=l(e,["tokenCount"]);s!=null&&r(t,["tokenCount"],s);const i=l(e,["finishReason"]);i!=null&&r(t,["finishReason"],i);const a=l(e,["avgLogprobs"]);a!=null&&r(t,["avgLogprobs"],a);const c=l(e,["groundingMetadata"]);c!=null&&r(t,["groundingMetadata"],c);const u=l(e,["index"]);u!=null&&r(t,["index"],u);const p=l(e,["logprobsResult"]);p!=null&&r(t,["logprobsResult"],p);const d=l(e,["safetyRatings"]);if(d!=null){let e=d;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["safetyRatings"],e)}const h=l(e,["urlContextMetadata"]);h!=null&&r(t,["urlContextMetadata"],h);return t}function Mo(e){const t={};const n=l(e,["citationSources"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["citations"],e)}return t}function Do(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let e=Xe(s);Array.isArray(e)&&(e=e.map((e=>e)));r(n,["contents"],e)}return n}function Uo(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["tokensInfo"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["tokensInfo"],e)}return t}function ko(e){const t={};const n=l(e,["values"]);n!=null&&r(t,["values"],n);const o=l(e,["statistics"]);o!=null&&r(t,["statistics"],Lo(o));return t}function Lo(e){const t={};const n=l(e,["truncated"]);n!=null&&r(t,["truncated"],n);const o=l(e,["token_count"]);o!=null&&r(t,["tokenCount"],o);return t}function qo(e){const t={};const n=l(e,["parts"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>Qs(e))));r(t,["parts"],e)}const o=l(e,["role"]);o!=null&&r(t,["role"],o);return t}function xo(e){const t={};const n=l(e,["controlType"]);n!=null&&r(t,["controlType"],n);const o=l(e,["enableControlImageComputation"]);o!=null&&r(t,["computeControl"],o);return t}function Go(e){const t={};if(l(e,["systemInstruction"])!==void 0)throw new Error("systemInstruction parameter is not supported in Gemini API.");if(l(e,["tools"])!==void 0)throw new Error("tools parameter is not supported in Gemini API.");if(l(e,["generationConfig"])!==void 0)throw new Error("generationConfig parameter is not supported in Gemini API.");return t}function Fo(e,t){const n={};const o=l(e,["systemInstruction"]);t!==void 0&&o!=null&&r(t,["systemInstruction"],$e(o));const s=l(e,["tools"]);if(t!==void 0&&s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>mi(e))));r(t,["tools"],e)}const i=l(e,["generationConfig"]);t!==void 0&&i!=null&&r(t,["generationConfig"],Us(i));return n}function Ho(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let e=Xe(s);Array.isArray(e)&&(e=e.map((e=>qo(e))));r(n,["contents"],e)}const i=l(t,["config"]);i!=null&&Go(i);return n}function Vo(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let e=Xe(s);Array.isArray(e)&&(e=e.map((e=>e)));r(n,["contents"],e)}const i=l(t,["config"]);i!=null&&Fo(i,n);return n}function jo(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["totalTokens"]);o!=null&&r(t,["totalTokens"],o);const s=l(e,["cachedContentTokenCount"]);s!=null&&r(t,["cachedContentTokenCount"],s);return t}function Bo(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["totalTokens"]);o!=null&&r(t,["totalTokens"],o);return t}function Jo(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","name"],xe(e,o));return n}function Yo(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","name"],xe(e,o));return n}function Wo(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}function Ko(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}function $o(e,t){const n={};const o=l(e,["outputGcsUri"]);t!==void 0&&o!=null&&r(t,["parameters","storageUri"],o);const s=l(e,["negativePrompt"]);t!==void 0&&s!=null&&r(t,["parameters","negativePrompt"],s);const i=l(e,["numberOfImages"]);t!==void 0&&i!=null&&r(t,["parameters","sampleCount"],i);const a=l(e,["aspectRatio"]);t!==void 0&&a!=null&&r(t,["parameters","aspectRatio"],a);const c=l(e,["guidanceScale"]);t!==void 0&&c!=null&&r(t,["parameters","guidanceScale"],c);const u=l(e,["seed"]);t!==void 0&&u!=null&&r(t,["parameters","seed"],u);const p=l(e,["safetyFilterLevel"]);t!==void 0&&p!=null&&r(t,["parameters","safetySetting"],p);const d=l(e,["personGeneration"]);t!==void 0&&d!=null&&r(t,["parameters","personGeneration"],d);const h=l(e,["includeSafetyAttributes"]);t!==void 0&&h!=null&&r(t,["parameters","includeSafetyAttributes"],h);const f=l(e,["includeRaiReason"]);t!==void 0&&f!=null&&r(t,["parameters","includeRaiReason"],f);const m=l(e,["language"]);t!==void 0&&m!=null&&r(t,["parameters","language"],m);const g=l(e,["outputMimeType"]);t!==void 0&&g!=null&&r(t,["parameters","outputOptions","mimeType"],g);const v=l(e,["outputCompressionQuality"]);t!==void 0&&v!=null&&r(t,["parameters","outputOptions","compressionQuality"],v);const y=l(e,["addWatermark"]);t!==void 0&&y!=null&&r(t,["parameters","addWatermark"],y);const E=l(e,["labels"]);t!==void 0&&E!=null&&r(t,["labels"],E);const _=l(e,["editMode"]);t!==void 0&&_!=null&&r(t,["parameters","editMode"],_);const I=l(e,["baseSteps"]);t!==void 0&&I!=null&&r(t,["parameters","editConfig","baseSteps"],I);return n}function zo(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["prompt"]);s!=null&&r(n,["instances[0]","prompt"],s);const i=l(t,["referenceImages"]);if(i!=null){let e=i;Array.isArray(e)&&(e=e.map((e=>si(e))));r(n,["instances[0]","referenceImages"],e)}const a=l(t,["config"]);a!=null&&$o(a,n);return n}function Xo(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["predictions"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>Ps(e))));r(t,["generatedImages"],e)}return t}function Qo(e,t){const n={};const o=l(e,["taskType"]);t!==void 0&&o!=null&&r(t,["requests[]","taskType"],o);const s=l(e,["title"]);t!==void 0&&s!=null&&r(t,["requests[]","title"],s);const i=l(e,["outputDimensionality"]);t!==void 0&&i!=null&&r(t,["requests[]","outputDimensionality"],i);if(l(e,["mimeType"])!==void 0)throw new Error("mimeType parameter is not supported in Gemini API.");if(l(e,["autoTruncate"])!==void 0)throw new Error("autoTruncate parameter is not supported in Gemini API.");return n}function Zo(e,t){const n={};const o=l(e,["taskType"]);t!==void 0&&o!=null&&r(t,["instances[]","task_type"],o);const s=l(e,["title"]);t!==void 0&&s!=null&&r(t,["instances[]","title"],s);const i=l(e,["outputDimensionality"]);t!==void 0&&i!=null&&r(t,["parameters","outputDimensionality"],i);const a=l(e,["mimeType"]);t!==void 0&&a!=null&&r(t,["instances[]","mimeType"],a);const c=l(e,["autoTruncate"]);t!==void 0&&c!=null&&r(t,["parameters","autoTruncate"],c);return n}function es(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let t=ze(e,s);Array.isArray(t)&&(t=t.map((e=>e)));r(n,["requests[]","content"],t)}const i=l(t,["config"]);i!=null&&Qo(i,n);const a=l(t,["model"]);a!==void 0&&r(n,["requests[]","model"],xe(e,a));return n}function ts(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let t=ze(e,s);Array.isArray(t)&&(t=t.map((e=>e)));r(n,["instances[]","content"],t)}const i=l(t,["config"]);i!=null&&Zo(i,n);return n}function ns(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["embeddings"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["embeddings"],e)}const s=l(e,["metadata"]);s!=null&&r(t,["metadata"],s);return t}function os(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["predictions[]","embeddings"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>ko(e))));r(t,["embeddings"],e)}const s=l(e,["metadata"]);s!=null&&r(t,["metadata"],s);return t}function ss(e){const t={};const n=l(e,["endpoint"]);n!=null&&r(t,["name"],n);const o=l(e,["deployedModelId"]);o!=null&&r(t,["deployedModelId"],o);return t}function is(e){const t={};if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const n=l(e,["fileUri"]);n!=null&&r(t,["fileUri"],n);const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function rs(e){const t={};if(l(e,["behavior"])!==void 0)throw new Error("behavior parameter is not supported in Vertex AI.");const n=l(e,["description"]);n!=null&&r(t,["description"],n);const o=l(e,["name"]);o!=null&&r(t,["name"],o);const s=l(e,["parameters"]);s!=null&&r(t,["parameters"],s);const i=l(e,["parametersJsonSchema"]);i!=null&&r(t,["parametersJsonSchema"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],a);const c=l(e,["responseJsonSchema"]);c!=null&&r(t,["responseJsonSchema"],c);return t}function ls(e,t,n){const o={};const s=l(t,["systemInstruction"]);n!==void 0&&s!=null&&r(n,["systemInstruction"],qo($e(s)));const i=l(t,["temperature"]);i!=null&&r(o,["temperature"],i);const a=l(t,["topP"]);a!=null&&r(o,["topP"],a);const c=l(t,["topK"]);c!=null&&r(o,["topK"],c);const u=l(t,["candidateCount"]);u!=null&&r(o,["candidateCount"],u);const p=l(t,["maxOutputTokens"]);p!=null&&r(o,["maxOutputTokens"],p);const d=l(t,["stopSequences"]);d!=null&&r(o,["stopSequences"],d);const h=l(t,["responseLogprobs"]);h!=null&&r(o,["responseLogprobs"],h);const f=l(t,["logprobs"]);f!=null&&r(o,["logprobs"],f);const m=l(t,["presencePenalty"]);m!=null&&r(o,["presencePenalty"],m);const g=l(t,["frequencyPenalty"]);g!=null&&r(o,["frequencyPenalty"],g);const v=l(t,["seed"]);v!=null&&r(o,["seed"],v);const y=l(t,["responseMimeType"]);y!=null&&r(o,["responseMimeType"],y);const E=l(t,["responseSchema"]);E!=null&&r(o,["responseSchema"],et(E));const _=l(t,["responseJsonSchema"]);_!=null&&r(o,["responseJsonSchema"],_);if(l(t,["routingConfig"])!==void 0)throw new Error("routingConfig parameter is not supported in Gemini API.");if(l(t,["modelSelectionConfig"])!==void 0)throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");const I=l(t,["safetySettings"]);if(n!==void 0&&I!=null){let e=I;Array.isArray(e)&&(e=e.map((e=>li(e))));r(n,["safetySettings"],e)}const T=l(t,["tools"]);if(n!==void 0&&T!=null){let e=st(T);Array.isArray(e)&&(e=e.map((e=>fi(ot(e)))));r(n,["tools"],e)}const C=l(t,["toolConfig"]);n!==void 0&&C!=null&&r(n,["toolConfig"],C);if(l(t,["labels"])!==void 0)throw new Error("labels parameter is not supported in Gemini API.");const A=l(t,["cachedContent"]);n!==void 0&&A!=null&&r(n,["cachedContent"],rt(e,A));const S=l(t,["responseModalities"]);S!=null&&r(o,["responseModalities"],S);const O=l(t,["mediaResolution"]);O!=null&&r(o,["mediaResolution"],O);const R=l(t,["speechConfig"]);R!=null&&r(o,["speechConfig"],tt(R));if(l(t,["audioTimestamp"])!==void 0)throw new Error("audioTimestamp parameter is not supported in Gemini API.");const b=l(t,["thinkingConfig"]);b!=null&&r(o,["thinkingConfig"],b);const N=l(t,["imageConfig"]);N!=null&&r(o,["imageConfig"],N);return o}function as(e,t,n){const o={};const s=l(t,["systemInstruction"]);n!==void 0&&s!=null&&r(n,["systemInstruction"],$e(s));const i=l(t,["temperature"]);i!=null&&r(o,["temperature"],i);const a=l(t,["topP"]);a!=null&&r(o,["topP"],a);const c=l(t,["topK"]);c!=null&&r(o,["topK"],c);const u=l(t,["candidateCount"]);u!=null&&r(o,["candidateCount"],u);const p=l(t,["maxOutputTokens"]);p!=null&&r(o,["maxOutputTokens"],p);const d=l(t,["stopSequences"]);d!=null&&r(o,["stopSequences"],d);const h=l(t,["responseLogprobs"]);h!=null&&r(o,["responseLogprobs"],h);const f=l(t,["logprobs"]);f!=null&&r(o,["logprobs"],f);const m=l(t,["presencePenalty"]);m!=null&&r(o,["presencePenalty"],m);const g=l(t,["frequencyPenalty"]);g!=null&&r(o,["frequencyPenalty"],g);const v=l(t,["seed"]);v!=null&&r(o,["seed"],v);const y=l(t,["responseMimeType"]);y!=null&&r(o,["responseMimeType"],y);const E=l(t,["responseSchema"]);E!=null&&r(o,["responseSchema"],et(E));const _=l(t,["responseJsonSchema"]);_!=null&&r(o,["responseJsonSchema"],_);const I=l(t,["routingConfig"]);I!=null&&r(o,["routingConfig"],I);const T=l(t,["modelSelectionConfig"]);T!=null&&r(o,["modelConfig"],T);const C=l(t,["safetySettings"]);if(n!==void 0&&C!=null){let e=C;Array.isArray(e)&&(e=e.map((e=>e)));r(n,["safetySettings"],e)}const A=l(t,["tools"]);if(n!==void 0&&A!=null){let e=st(A);Array.isArray(e)&&(e=e.map((e=>mi(ot(e)))));r(n,["tools"],e)}const S=l(t,["toolConfig"]);n!==void 0&&S!=null&&r(n,["toolConfig"],S);const O=l(t,["labels"]);n!==void 0&&O!=null&&r(n,["labels"],O);const R=l(t,["cachedContent"]);n!==void 0&&R!=null&&r(n,["cachedContent"],rt(e,R));const b=l(t,["responseModalities"]);b!=null&&r(o,["responseModalities"],b);const N=l(t,["mediaResolution"]);N!=null&&r(o,["mediaResolution"],N);const P=l(t,["speechConfig"]);P!=null&&r(o,["speechConfig"],hi(tt(P)));const w=l(t,["audioTimestamp"]);w!=null&&r(o,["audioTimestamp"],w);const M=l(t,["thinkingConfig"]);M!=null&&r(o,["thinkingConfig"],M);const D=l(t,["imageConfig"]);D!=null&&r(o,["imageConfig"],D);return o}function cs(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let e=Xe(s);Array.isArray(e)&&(e=e.map((e=>qo(e))));r(n,["contents"],e)}const i=l(t,["config"]);i!=null&&r(n,["generationConfig"],ls(e,i,n));return n}function us(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["contents"]);if(s!=null){let e=Xe(s);Array.isArray(e)&&(e=e.map((e=>e)));r(n,["contents"],e)}const i=l(t,["config"]);i!=null&&r(n,["generationConfig"],as(e,i,n));return n}function ps(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["candidates"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>wo(e))));r(t,["candidates"],e)}const s=l(e,["modelVersion"]);s!=null&&r(t,["modelVersion"],s);const i=l(e,["promptFeedback"]);i!=null&&r(t,["promptFeedback"],i);const a=l(e,["responseId"]);a!=null&&r(t,["responseId"],a);const c=l(e,["usageMetadata"]);c!=null&&r(t,["usageMetadata"],c);return t}function ds(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["candidates"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["candidates"],e)}const s=l(e,["createTime"]);s!=null&&r(t,["createTime"],s);const i=l(e,["modelVersion"]);i!=null&&r(t,["modelVersion"],i);const a=l(e,["promptFeedback"]);a!=null&&r(t,["promptFeedback"],a);const c=l(e,["responseId"]);c!=null&&r(t,["responseId"],c);const u=l(e,["usageMetadata"]);u!=null&&r(t,["usageMetadata"],u);return t}function hs(e,t){const n={};if(l(e,["outputGcsUri"])!==void 0)throw new Error("outputGcsUri parameter is not supported in Gemini API.");if(l(e,["negativePrompt"])!==void 0)throw new Error("negativePrompt parameter is not supported in Gemini API.");const o=l(e,["numberOfImages"]);t!==void 0&&o!=null&&r(t,["parameters","sampleCount"],o);const s=l(e,["aspectRatio"]);t!==void 0&&s!=null&&r(t,["parameters","aspectRatio"],s);const i=l(e,["guidanceScale"]);t!==void 0&&i!=null&&r(t,["parameters","guidanceScale"],i);if(l(e,["seed"])!==void 0)throw new Error("seed parameter is not supported in Gemini API.");const a=l(e,["safetyFilterLevel"]);t!==void 0&&a!=null&&r(t,["parameters","safetySetting"],a);const c=l(e,["personGeneration"]);t!==void 0&&c!=null&&r(t,["parameters","personGeneration"],c);const u=l(e,["includeSafetyAttributes"]);t!==void 0&&u!=null&&r(t,["parameters","includeSafetyAttributes"],u);const p=l(e,["includeRaiReason"]);t!==void 0&&p!=null&&r(t,["parameters","includeRaiReason"],p);const d=l(e,["language"]);t!==void 0&&d!=null&&r(t,["parameters","language"],d);const h=l(e,["outputMimeType"]);t!==void 0&&h!=null&&r(t,["parameters","outputOptions","mimeType"],h);const f=l(e,["outputCompressionQuality"]);t!==void 0&&f!=null&&r(t,["parameters","outputOptions","compressionQuality"],f);if(l(e,["addWatermark"])!==void 0)throw new Error("addWatermark parameter is not supported in Gemini API.");if(l(e,["labels"])!==void 0)throw new Error("labels parameter is not supported in Gemini API.");const m=l(e,["imageSize"]);t!==void 0&&m!=null&&r(t,["parameters","sampleImageSize"],m);if(l(e,["enhancePrompt"])!==void 0)throw new Error("enhancePrompt parameter is not supported in Gemini API.");return n}function fs(e,t){const n={};const o=l(e,["outputGcsUri"]);t!==void 0&&o!=null&&r(t,["parameters","storageUri"],o);const s=l(e,["negativePrompt"]);t!==void 0&&s!=null&&r(t,["parameters","negativePrompt"],s);const i=l(e,["numberOfImages"]);t!==void 0&&i!=null&&r(t,["parameters","sampleCount"],i);const a=l(e,["aspectRatio"]);t!==void 0&&a!=null&&r(t,["parameters","aspectRatio"],a);const c=l(e,["guidanceScale"]);t!==void 0&&c!=null&&r(t,["parameters","guidanceScale"],c);const u=l(e,["seed"]);t!==void 0&&u!=null&&r(t,["parameters","seed"],u);const p=l(e,["safetyFilterLevel"]);t!==void 0&&p!=null&&r(t,["parameters","safetySetting"],p);const d=l(e,["personGeneration"]);t!==void 0&&d!=null&&r(t,["parameters","personGeneration"],d);const h=l(e,["includeSafetyAttributes"]);t!==void 0&&h!=null&&r(t,["parameters","includeSafetyAttributes"],h);const f=l(e,["includeRaiReason"]);t!==void 0&&f!=null&&r(t,["parameters","includeRaiReason"],f);const m=l(e,["language"]);t!==void 0&&m!=null&&r(t,["parameters","language"],m);const g=l(e,["outputMimeType"]);t!==void 0&&g!=null&&r(t,["parameters","outputOptions","mimeType"],g);const v=l(e,["outputCompressionQuality"]);t!==void 0&&v!=null&&r(t,["parameters","outputOptions","compressionQuality"],v);const y=l(e,["addWatermark"]);t!==void 0&&y!=null&&r(t,["parameters","addWatermark"],y);const E=l(e,["labels"]);t!==void 0&&E!=null&&r(t,["labels"],E);const _=l(e,["imageSize"]);t!==void 0&&_!=null&&r(t,["parameters","sampleImageSize"],_);const I=l(e,["enhancePrompt"]);t!==void 0&&I!=null&&r(t,["parameters","enhancePrompt"],I);return n}function ms(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["prompt"]);s!=null&&r(n,["instances[0]","prompt"],s);const i=l(t,["config"]);i!=null&&hs(i,n);return n}function gs(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["prompt"]);s!=null&&r(n,["instances[0]","prompt"],s);const i=l(t,["config"]);i!=null&&fs(i,n);return n}function vs(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["predictions"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>Ns(e))));r(t,["generatedImages"],e)}const s=l(e,["positivePromptSafetyAttributes"]);s!=null&&r(t,["positivePromptSafetyAttributes"],ii(s));return t}function ys(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["predictions"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>Ps(e))));r(t,["generatedImages"],e)}const s=l(e,["positivePromptSafetyAttributes"]);s!=null&&r(t,["positivePromptSafetyAttributes"],ri(s));return t}function Es(e,t){const n={};const o=l(e,["numberOfVideos"]);t!==void 0&&o!=null&&r(t,["parameters","sampleCount"],o);if(l(e,["outputGcsUri"])!==void 0)throw new Error("outputGcsUri parameter is not supported in Gemini API.");if(l(e,["fps"])!==void 0)throw new Error("fps parameter is not supported in Gemini API.");const s=l(e,["durationSeconds"]);t!==void 0&&s!=null&&r(t,["parameters","durationSeconds"],s);if(l(e,["seed"])!==void 0)throw new Error("seed parameter is not supported in Gemini API.");const i=l(e,["aspectRatio"]);t!==void 0&&i!=null&&r(t,["parameters","aspectRatio"],i);const a=l(e,["resolution"]);t!==void 0&&a!=null&&r(t,["parameters","resolution"],a);const c=l(e,["personGeneration"]);t!==void 0&&c!=null&&r(t,["parameters","personGeneration"],c);if(l(e,["pubsubTopic"])!==void 0)throw new Error("pubsubTopic parameter is not supported in Gemini API.");const u=l(e,["negativePrompt"]);t!==void 0&&u!=null&&r(t,["parameters","negativePrompt"],u);const p=l(e,["enhancePrompt"]);t!==void 0&&p!=null&&r(t,["parameters","enhancePrompt"],p);if(l(e,["generateAudio"])!==void 0)throw new Error("generateAudio parameter is not supported in Gemini API.");const d=l(e,["lastFrame"]);t!==void 0&&d!=null&&r(t,["instances[0]","lastFrame"],Hs(d));const h=l(e,["referenceImages"]);if(t!==void 0&&h!=null){let e=h;Array.isArray(e)&&(e=e.map((e=>bi(e))));r(t,["instances[0]","referenceImages"],e)}if(l(e,["mask"])!==void 0)throw new Error("mask parameter is not supported in Gemini API.");if(l(e,["compressionQuality"])!==void 0)throw new Error("compressionQuality parameter is not supported in Gemini API.");return n}function _s(e,t){const n={};const o=l(e,["numberOfVideos"]);t!==void 0&&o!=null&&r(t,["parameters","sampleCount"],o);const s=l(e,["outputGcsUri"]);t!==void 0&&s!=null&&r(t,["parameters","storageUri"],s);const i=l(e,["fps"]);t!==void 0&&i!=null&&r(t,["parameters","fps"],i);const a=l(e,["durationSeconds"]);t!==void 0&&a!=null&&r(t,["parameters","durationSeconds"],a);const c=l(e,["seed"]);t!==void 0&&c!=null&&r(t,["parameters","seed"],c);const u=l(e,["aspectRatio"]);t!==void 0&&u!=null&&r(t,["parameters","aspectRatio"],u);const p=l(e,["resolution"]);t!==void 0&&p!=null&&r(t,["parameters","resolution"],p);const d=l(e,["personGeneration"]);t!==void 0&&d!=null&&r(t,["parameters","personGeneration"],d);const h=l(e,["pubsubTopic"]);t!==void 0&&h!=null&&r(t,["parameters","pubsubTopic"],h);const f=l(e,["negativePrompt"]);t!==void 0&&f!=null&&r(t,["parameters","negativePrompt"],f);const m=l(e,["enhancePrompt"]);t!==void 0&&m!=null&&r(t,["parameters","enhancePrompt"],m);const g=l(e,["generateAudio"]);t!==void 0&&g!=null&&r(t,["parameters","generateAudio"],g);const v=l(e,["lastFrame"]);t!==void 0&&v!=null&&r(t,["instances[0]","lastFrame"],Vs(v));const y=l(e,["referenceImages"]);if(t!==void 0&&y!=null){let e=y;Array.isArray(e)&&(e=e.map((e=>Ni(e))));r(t,["instances[0]","referenceImages"],e)}const E=l(e,["mask"]);t!==void 0&&E!=null&&r(t,["instances[0]","mask"],Ri(E));const _=l(e,["compressionQuality"]);t!==void 0&&_!=null&&r(t,["parameters","compressionQuality"],_);return n}function Is(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response","generateVideoResponse"]);a!=null&&r(t,["response"],Ss(a));return t}function Ts(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],Os(a));return t}function Cs(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["prompt"]);s!=null&&r(n,["instances[0]","prompt"],s);const i=l(t,["image"]);i!=null&&r(n,["instances[0]","image"],Hs(i));const a=l(t,["video"]);a!=null&&r(n,["instances[0]","video"],Pi(a));const c=l(t,["source"]);c!=null&&Rs(c,n);const u=l(t,["config"]);u!=null&&Es(u,n);return n}function As(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["prompt"]);s!=null&&r(n,["instances[0]","prompt"],s);const i=l(t,["image"]);i!=null&&r(n,["instances[0]","image"],Vs(i));const a=l(t,["video"]);a!=null&&r(n,["instances[0]","video"],wi(a));const c=l(t,["source"]);c!=null&&bs(c,n);const u=l(t,["config"]);u!=null&&_s(u,n);return n}function Ss(e){const t={};const n=l(e,["generatedSamples"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>Ms(e))));r(t,["generatedVideos"],e)}const o=l(e,["raiMediaFilteredCount"]);o!=null&&r(t,["raiMediaFilteredCount"],o);const s=l(e,["raiMediaFilteredReasons"]);s!=null&&r(t,["raiMediaFilteredReasons"],s);return t}function Os(e){const t={};const n=l(e,["videos"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>Ds(e))));r(t,["generatedVideos"],e)}const o=l(e,["raiMediaFilteredCount"]);o!=null&&r(t,["raiMediaFilteredCount"],o);const s=l(e,["raiMediaFilteredReasons"]);s!=null&&r(t,["raiMediaFilteredReasons"],s);return t}function Rs(e,t){const n={};const o=l(e,["prompt"]);t!==void 0&&o!=null&&r(t,["instances[0]","prompt"],o);const s=l(e,["image"]);t!==void 0&&s!=null&&r(t,["instances[0]","image"],Hs(s));const i=l(e,["video"]);t!==void 0&&i!=null&&r(t,["instances[0]","video"],Pi(i));return n}function bs(e,t){const n={};const o=l(e,["prompt"]);t!==void 0&&o!=null&&r(t,["instances[0]","prompt"],o);const s=l(e,["image"]);t!==void 0&&s!=null&&r(t,["instances[0]","image"],Vs(s));const i=l(e,["video"]);t!==void 0&&i!=null&&r(t,["instances[0]","video"],wi(i));return n}function Ns(e){const t={};const n=l(e,["_self"]);n!=null&&r(t,["image"],Gs(n));const o=l(e,["raiFilteredReason"]);o!=null&&r(t,["raiFilteredReason"],o);const s=l(e,["_self"]);s!=null&&r(t,["safetyAttributes"],ii(s));return t}function Ps(e){const t={};const n=l(e,["_self"]);n!=null&&r(t,["image"],Fs(n));const o=l(e,["raiFilteredReason"]);o!=null&&r(t,["raiFilteredReason"],o);const s=l(e,["_self"]);s!=null&&r(t,["safetyAttributes"],ri(s));const i=l(e,["prompt"]);i!=null&&r(t,["enhancedPrompt"],i);return t}function ws(e){const t={};const n=l(e,["_self"]);n!=null&&r(t,["mask"],Fs(n));const o=l(e,["labels"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["labels"],e)}return t}function Ms(e){const t={};const n=l(e,["video"]);n!=null&&r(t,["video"],Si(n));return t}function Ds(e){const t={};const n=l(e,["_self"]);n!=null&&r(t,["video"],Oi(n));return t}function Us(e){const t={};const n=l(e,["modelSelectionConfig"]);n!=null&&r(t,["modelConfig"],n);const o=l(e,["responseJsonSchema"]);o!=null&&r(t,["responseJsonSchema"],o);const s=l(e,["audioTimestamp"]);s!=null&&r(t,["audioTimestamp"],s);const i=l(e,["candidateCount"]);i!=null&&r(t,["candidateCount"],i);const a=l(e,["enableAffectiveDialog"]);a!=null&&r(t,["enableAffectiveDialog"],a);const c=l(e,["frequencyPenalty"]);c!=null&&r(t,["frequencyPenalty"],c);const u=l(e,["logprobs"]);u!=null&&r(t,["logprobs"],u);const p=l(e,["maxOutputTokens"]);p!=null&&r(t,["maxOutputTokens"],p);const d=l(e,["mediaResolution"]);d!=null&&r(t,["mediaResolution"],d);const h=l(e,["presencePenalty"]);h!=null&&r(t,["presencePenalty"],h);const f=l(e,["responseLogprobs"]);f!=null&&r(t,["responseLogprobs"],f);const m=l(e,["responseMimeType"]);m!=null&&r(t,["responseMimeType"],m);const g=l(e,["responseModalities"]);g!=null&&r(t,["responseModalities"],g);const v=l(e,["responseSchema"]);v!=null&&r(t,["responseSchema"],v);const y=l(e,["routingConfig"]);y!=null&&r(t,["routingConfig"],y);const E=l(e,["seed"]);E!=null&&r(t,["seed"],E);const _=l(e,["speechConfig"]);_!=null&&r(t,["speechConfig"],hi(_));const I=l(e,["stopSequences"]);I!=null&&r(t,["stopSequences"],I);const T=l(e,["temperature"]);T!=null&&r(t,["temperature"],T);const C=l(e,["thinkingConfig"]);C!=null&&r(t,["thinkingConfig"],C);const A=l(e,["topK"]);A!=null&&r(t,["topK"],A);const S=l(e,["topP"]);S!=null&&r(t,["topP"],S);if(l(e,["enableEnhancedCivicAnswers"])!==void 0)throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");return t}function ks(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","name"],xe(e,o));return n}function Ls(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","name"],xe(e,o));return n}function qs(e){const t={};if(l(e,["authConfig"])!==void 0)throw new Error("authConfig parameter is not supported in Gemini API.");const n=l(e,["enableWidget"]);n!=null&&r(t,["enableWidget"],n);return t}function xs(e){const t={};if(l(e,["excludeDomains"])!==void 0)throw new Error("excludeDomains parameter is not supported in Gemini API.");if(l(e,["blockingConfidence"])!==void 0)throw new Error("blockingConfidence parameter is not supported in Gemini API.");const n=l(e,["timeRangeFilter"]);n!=null&&r(t,["timeRangeFilter"],n);return t}function Gs(e){const t={};const n=l(e,["bytesBase64Encoded"]);n!=null&&r(t,["imageBytes"],at(n));const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function Fs(e){const t={};const n=l(e,["gcsUri"]);n!=null&&r(t,["gcsUri"],n);const o=l(e,["bytesBase64Encoded"]);o!=null&&r(t,["imageBytes"],at(o));const s=l(e,["mimeType"]);s!=null&&r(t,["mimeType"],s);return t}function Hs(e){const t={};if(l(e,["gcsUri"])!==void 0)throw new Error("gcsUri parameter is not supported in Gemini API.");const n=l(e,["imageBytes"]);n!=null&&r(t,["bytesBase64Encoded"],at(n));const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function Vs(e){const t={};const n=l(e,["gcsUri"]);n!=null&&r(t,["gcsUri"],n);const o=l(e,["imageBytes"]);o!=null&&r(t,["bytesBase64Encoded"],at(o));const s=l(e,["mimeType"]);s!=null&&r(t,["mimeType"],s);return t}function js(e,t,n){const o={};const s=l(t,["pageSize"]);n!==void 0&&s!=null&&r(n,["_query","pageSize"],s);const i=l(t,["pageToken"]);n!==void 0&&i!=null&&r(n,["_query","pageToken"],i);const a=l(t,["filter"]);n!==void 0&&a!=null&&r(n,["_query","filter"],a);const c=l(t,["queryBase"]);n!==void 0&&c!=null&&r(n,["_url","models_url"],ht(e,c));return o}function Bs(e,t,n){const o={};const s=l(t,["pageSize"]);n!==void 0&&s!=null&&r(n,["_query","pageSize"],s);const i=l(t,["pageToken"]);n!==void 0&&i!=null&&r(n,["_query","pageToken"],i);const a=l(t,["filter"]);n!==void 0&&a!=null&&r(n,["_query","filter"],a);const c=l(t,["queryBase"]);n!==void 0&&c!=null&&r(n,["_url","models_url"],ht(e,c));return o}function Js(e,t){const n={};const o=l(t,["config"]);o!=null&&js(e,o,n);return n}function Ys(e,t){const n={};const o=l(t,["config"]);o!=null&&Bs(e,o,n);return n}function Ws(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["_self"]);if(s!=null){let e=ft(s);Array.isArray(e)&&(e=e.map((e=>zs(e))));r(t,["models"],e)}return t}function Ks(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["_self"]);if(s!=null){let e=ft(s);Array.isArray(e)&&(e=e.map((e=>Xs(e))));r(t,["models"],e)}return t}function $s(e){const t={};const n=l(e,["maskMode"]);n!=null&&r(t,["maskMode"],n);const o=l(e,["segmentationClasses"]);o!=null&&r(t,["maskClasses"],o);const s=l(e,["maskDilation"]);s!=null&&r(t,["dilation"],s);return t}function zs(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["displayName"]);o!=null&&r(t,["displayName"],o);const s=l(e,["description"]);s!=null&&r(t,["description"],s);const i=l(e,["version"]);i!=null&&r(t,["version"],i);const a=l(e,["_self"]);a!=null&&r(t,["tunedModelInfo"],gi(a));const c=l(e,["inputTokenLimit"]);c!=null&&r(t,["inputTokenLimit"],c);const u=l(e,["outputTokenLimit"]);u!=null&&r(t,["outputTokenLimit"],u);const p=l(e,["supportedGenerationMethods"]);p!=null&&r(t,["supportedActions"],p);const d=l(e,["temperature"]);d!=null&&r(t,["temperature"],d);const h=l(e,["maxTemperature"]);h!=null&&r(t,["maxTemperature"],h);const f=l(e,["topP"]);f!=null&&r(t,["topP"],f);const m=l(e,["topK"]);m!=null&&r(t,["topK"],m);const g=l(e,["thinking"]);g!=null&&r(t,["thinking"],g);return t}function Xs(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["displayName"]);o!=null&&r(t,["displayName"],o);const s=l(e,["description"]);s!=null&&r(t,["description"],s);const i=l(e,["versionId"]);i!=null&&r(t,["version"],i);const a=l(e,["deployedModels"]);if(a!=null){let e=a;Array.isArray(e)&&(e=e.map((e=>ss(e))));r(t,["endpoints"],e)}const c=l(e,["labels"]);c!=null&&r(t,["labels"],c);const u=l(e,["_self"]);u!=null&&r(t,["tunedModelInfo"],vi(u));const p=l(e,["defaultCheckpointId"]);p!=null&&r(t,["defaultCheckpointId"],p);const d=l(e,["checkpoints"]);if(d!=null){let e=d;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["checkpoints"],e)}return t}function Qs(e){const t={};const n=l(e,["functionCall"]);n!=null&&r(t,["functionCall"],n);const o=l(e,["codeExecutionResult"]);o!=null&&r(t,["codeExecutionResult"],o);const s=l(e,["executableCode"]);s!=null&&r(t,["executableCode"],s);const i=l(e,["fileData"]);i!=null&&r(t,["fileData"],is(i));const a=l(e,["functionResponse"]);a!=null&&r(t,["functionResponse"],a);const c=l(e,["inlineData"]);c!=null&&r(t,["inlineData"],Po(c));const u=l(e,["text"]);u!=null&&r(t,["text"],u);const p=l(e,["thought"]);p!=null&&r(t,["thought"],p);const d=l(e,["thoughtSignature"]);d!=null&&r(t,["thoughtSignature"],d);const h=l(e,["videoMetadata"]);h!=null&&r(t,["videoMetadata"],h);return t}function Zs(e){const t={};const n=l(e,["productImage"]);n!=null&&r(t,["image"],Vs(n));return t}function ei(e,t){const n={};const o=l(e,["numberOfImages"]);t!==void 0&&o!=null&&r(t,["parameters","sampleCount"],o);const s=l(e,["baseSteps"]);t!==void 0&&s!=null&&r(t,["parameters","baseSteps"],s);const i=l(e,["outputGcsUri"]);t!==void 0&&i!=null&&r(t,["parameters","storageUri"],i);const a=l(e,["seed"]);t!==void 0&&a!=null&&r(t,["parameters","seed"],a);const c=l(e,["safetyFilterLevel"]);t!==void 0&&c!=null&&r(t,["parameters","safetySetting"],c);const u=l(e,["personGeneration"]);t!==void 0&&u!=null&&r(t,["parameters","personGeneration"],u);const p=l(e,["addWatermark"]);t!==void 0&&p!=null&&r(t,["parameters","addWatermark"],p);const d=l(e,["outputMimeType"]);t!==void 0&&d!=null&&r(t,["parameters","outputOptions","mimeType"],d);const h=l(e,["outputCompressionQuality"]);t!==void 0&&h!=null&&r(t,["parameters","outputOptions","compressionQuality"],h);const f=l(e,["enhancePrompt"]);t!==void 0&&f!=null&&r(t,["parameters","enhancePrompt"],f);const m=l(e,["labels"]);t!==void 0&&m!=null&&r(t,["labels"],m);return n}function ti(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["source"]);s!=null&&oi(s,n);const i=l(t,["config"]);i!=null&&ei(i,n);return n}function ni(e){const t={};const n=l(e,["predictions"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>Ps(e))));r(t,["generatedImages"],e)}return t}function oi(e,t){const n={};const o=l(e,["prompt"]);t!==void 0&&o!=null&&r(t,["instances[0]","prompt"],o);const s=l(e,["personImage"]);t!==void 0&&s!=null&&r(t,["instances[0]","personImage","image"],Vs(s));const i=l(e,["productImages"]);if(t!==void 0&&i!=null){let e=i;Array.isArray(e)&&(e=e.map((e=>Zs(e))));r(t,["instances[0]","productImages"],e)}return n}function si(e){const t={};const n=l(e,["referenceImage"]);n!=null&&r(t,["referenceImage"],Vs(n));const o=l(e,["referenceId"]);o!=null&&r(t,["referenceId"],o);const s=l(e,["referenceType"]);s!=null&&r(t,["referenceType"],s);const i=l(e,["maskImageConfig"]);i!=null&&r(t,["maskImageConfig"],$s(i));const a=l(e,["controlImageConfig"]);a!=null&&r(t,["controlImageConfig"],xo(a));const c=l(e,["styleImageConfig"]);c!=null&&r(t,["styleImageConfig"],c);const u=l(e,["subjectImageConfig"]);u!=null&&r(t,["subjectImageConfig"],u);return t}function ii(e){const t={};const n=l(e,["safetyAttributes","categories"]);n!=null&&r(t,["categories"],n);const o=l(e,["safetyAttributes","scores"]);o!=null&&r(t,["scores"],o);const s=l(e,["contentType"]);s!=null&&r(t,["contentType"],s);return t}function ri(e){const t={};const n=l(e,["safetyAttributes","categories"]);n!=null&&r(t,["categories"],n);const o=l(e,["safetyAttributes","scores"]);o!=null&&r(t,["scores"],o);const s=l(e,["contentType"]);s!=null&&r(t,["contentType"],s);return t}function li(e){const t={};const n=l(e,["category"]);n!=null&&r(t,["category"],n);if(l(e,["method"])!==void 0)throw new Error("method parameter is not supported in Gemini API.");const o=l(e,["threshold"]);o!=null&&r(t,["threshold"],o);return t}function ai(e){const t={};const n=l(e,["image"]);n!=null&&r(t,["image"],Vs(n));return t}function ci(e,t){const n={};const o=l(e,["mode"]);t!==void 0&&o!=null&&r(t,["parameters","mode"],o);const s=l(e,["maxPredictions"]);t!==void 0&&s!=null&&r(t,["parameters","maxPredictions"],s);const i=l(e,["confidenceThreshold"]);t!==void 0&&i!=null&&r(t,["parameters","confidenceThreshold"],i);const a=l(e,["maskDilation"]);t!==void 0&&a!=null&&r(t,["parameters","maskDilation"],a);const c=l(e,["binaryColorThreshold"]);t!==void 0&&c!=null&&r(t,["parameters","binaryColorThreshold"],c);const u=l(e,["labels"]);t!==void 0&&u!=null&&r(t,["labels"],u);return n}function ui(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["source"]);s!=null&&di(s,n);const i=l(t,["config"]);i!=null&&ci(i,n);return n}function pi(e){const t={};const n=l(e,["predictions"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>ws(e))));r(t,["generatedMasks"],e)}return t}function di(e,t){const n={};const o=l(e,["prompt"]);t!==void 0&&o!=null&&r(t,["instances[0]","prompt"],o);const s=l(e,["image"]);t!==void 0&&s!=null&&r(t,["instances[0]","image"],Vs(s));const i=l(e,["scribbleImage"]);t!==void 0&&i!=null&&r(t,["instances[0]","scribble"],ai(i));return n}function hi(e){const t={};const n=l(e,["languageCode"]);n!=null&&r(t,["languageCode"],n);const o=l(e,["voiceConfig"]);o!=null&&r(t,["voiceConfig"],o);if(l(e,["multiSpeakerVoiceConfig"])!==void 0)throw new Error("multiSpeakerVoiceConfig parameter is not supported in Vertex AI.");return t}function fi(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["functionDeclarations"],e)}if(l(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");const o=l(e,["googleSearchRetrieval"]);o!=null&&r(t,["googleSearchRetrieval"],o);const s=l(e,["computerUse"]);s!=null&&r(t,["computerUse"],s);const i=l(e,["fileSearch"]);i!=null&&r(t,["fileSearch"],i);const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);if(l(e,["enterpriseWebSearch"])!==void 0)throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");const c=l(e,["googleMaps"]);c!=null&&r(t,["googleMaps"],qs(c));const u=l(e,["googleSearch"]);u!=null&&r(t,["googleSearch"],xs(u));const p=l(e,["urlContext"]);p!=null&&r(t,["urlContext"],p);return t}function mi(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>rs(e))));r(t,["functionDeclarations"],e)}const o=l(e,["retrieval"]);o!=null&&r(t,["retrieval"],o);const s=l(e,["googleSearchRetrieval"]);s!=null&&r(t,["googleSearchRetrieval"],s);const i=l(e,["computerUse"]);i!=null&&r(t,["computerUse"],i);if(l(e,["fileSearch"])!==void 0)throw new Error("fileSearch parameter is not supported in Vertex AI.");const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);const c=l(e,["enterpriseWebSearch"]);c!=null&&r(t,["enterpriseWebSearch"],c);const u=l(e,["googleMaps"]);u!=null&&r(t,["googleMaps"],u);const p=l(e,["googleSearch"]);p!=null&&r(t,["googleSearch"],p);const d=l(e,["urlContext"]);d!=null&&r(t,["urlContext"],d);return t}function gi(e){const t={};const n=l(e,["baseModel"]);n!=null&&r(t,["baseModel"],n);const o=l(e,["createTime"]);o!=null&&r(t,["createTime"],o);const s=l(e,["updateTime"]);s!=null&&r(t,["updateTime"],s);return t}function vi(e){const t={};const n=l(e,["labels","google-vertex-llm-tuning-base-model-id"]);n!=null&&r(t,["baseModel"],n);const o=l(e,["createTime"]);o!=null&&r(t,["createTime"],o);const s=l(e,["updateTime"]);s!=null&&r(t,["updateTime"],s);return t}function yi(e,t){const n={};const o=l(e,["displayName"]);t!==void 0&&o!=null&&r(t,["displayName"],o);const s=l(e,["description"]);t!==void 0&&s!=null&&r(t,["description"],s);const i=l(e,["defaultCheckpointId"]);t!==void 0&&i!=null&&r(t,["defaultCheckpointId"],i);return n}function Ei(e,t){const n={};const o=l(e,["displayName"]);t!==void 0&&o!=null&&r(t,["displayName"],o);const s=l(e,["description"]);t!==void 0&&s!=null&&r(t,["description"],s);const i=l(e,["defaultCheckpointId"]);t!==void 0&&i!=null&&r(t,["defaultCheckpointId"],i);return n}function _i(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","name"],xe(e,o));const s=l(t,["config"]);s!=null&&yi(s,n);return n}function Ii(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["config"]);s!=null&&Ei(s,n);return n}function Ti(e,t){const n={};const o=l(e,["outputGcsUri"]);t!==void 0&&o!=null&&r(t,["parameters","storageUri"],o);const s=l(e,["safetyFilterLevel"]);t!==void 0&&s!=null&&r(t,["parameters","safetySetting"],s);const i=l(e,["personGeneration"]);t!==void 0&&i!=null&&r(t,["parameters","personGeneration"],i);const a=l(e,["includeRaiReason"]);t!==void 0&&a!=null&&r(t,["parameters","includeRaiReason"],a);const c=l(e,["outputMimeType"]);t!==void 0&&c!=null&&r(t,["parameters","outputOptions","mimeType"],c);const u=l(e,["outputCompressionQuality"]);t!==void 0&&u!=null&&r(t,["parameters","outputOptions","compressionQuality"],u);const p=l(e,["enhanceInputImage"]);t!==void 0&&p!=null&&r(t,["parameters","upscaleConfig","enhanceInputImage"],p);const d=l(e,["imagePreservationFactor"]);t!==void 0&&d!=null&&r(t,["parameters","upscaleConfig","imagePreservationFactor"],d);const h=l(e,["labels"]);t!==void 0&&h!=null&&r(t,["labels"],h);const f=l(e,["numberOfImages"]);t!==void 0&&f!=null&&r(t,["parameters","sampleCount"],f);const m=l(e,["mode"]);t!==void 0&&m!=null&&r(t,["parameters","mode"],m);return n}function Ci(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["_url","model"],xe(e,o));const s=l(t,["image"]);s!=null&&r(n,["instances[0]","image"],Vs(s));const i=l(t,["upscaleFactor"]);i!=null&&r(n,["parameters","upscaleConfig","upscaleFactor"],i);const a=l(t,["config"]);a!=null&&Ti(a,n);return n}function Ai(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["predictions"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>Ps(e))));r(t,["generatedImages"],e)}return t}function Si(e){const t={};const n=l(e,["uri"]);n!=null&&r(t,["uri"],n);const o=l(e,["encodedVideo"]);o!=null&&r(t,["videoBytes"],at(o));const s=l(e,["encoding"]);s!=null&&r(t,["mimeType"],s);return t}function Oi(e){const t={};const n=l(e,["gcsUri"]);n!=null&&r(t,["uri"],n);const o=l(e,["bytesBase64Encoded"]);o!=null&&r(t,["videoBytes"],at(o));const s=l(e,["mimeType"]);s!=null&&r(t,["mimeType"],s);return t}function Ri(e){const t={};const n=l(e,["image"]);n!=null&&r(t,["_self"],Vs(n));const o=l(e,["maskMode"]);o!=null&&r(t,["maskMode"],o);return t}function bi(e){const t={};const n=l(e,["image"]);n!=null&&r(t,["image"],Hs(n));const o=l(e,["referenceType"]);o!=null&&r(t,["referenceType"],o);return t}function Ni(e){const t={};const n=l(e,["image"]);n!=null&&r(t,["image"],Vs(n));const o=l(e,["referenceType"]);o!=null&&r(t,["referenceType"],o);return t}function Pi(e){const t={};const n=l(e,["uri"]);n!=null&&r(t,["uri"],n);const o=l(e,["videoBytes"]);o!=null&&r(t,["encodedVideo"],at(o));const s=l(e,["mimeType"]);s!=null&&r(t,["encoding"],s);return t}function wi(e){const t={};const n=l(e,["uri"]);n!=null&&r(t,["gcsUri"],n);const o=l(e,["videoBytes"]);o!=null&&r(t,["bytesBase64Encoded"],at(o));const s=l(e,["mimeType"]);s!=null&&r(t,["mimeType"],s);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Mi="Content-Type";const Di="X-Server-Timeout";const Ui="User-Agent";const ki="x-goog-api-client";const Li="1.29.1";const qi=`google-genai-sdk/${Li}`;const xi="v1beta1";const Gi="v1beta";const Fi=/^\s*data: (.*)(?:\n\n|\r\r|\r\n\r\n)/;class ApiClient{constructor(e){var t,n;this.clientOptions=Object.assign(Object.assign({},e),{project:e.project,location:e.location,apiKey:e.apiKey,vertexai:e.vertexai});const o={};if(this.clientOptions.vertexai){o.apiVersion=(t=this.clientOptions.apiVersion)!==null&&t!==void 0?t:xi;o.baseUrl=this.baseUrlFromProjectLocation();this.normalizeAuthParameters()}else{o.apiVersion=(n=this.clientOptions.apiVersion)!==null&&n!==void 0?n:Gi;o.baseUrl="https://generativelanguage.googleapis.com/"}o.headers=this.getDefaultHeaders();this.clientOptions.httpOptions=o;e.httpOptions&&(this.clientOptions.httpOptions=this.patchHttpOptions(o,e.httpOptions))}baseUrlFromProjectLocation(){return this.clientOptions.project&&this.clientOptions.location&&this.clientOptions.location!=="global"?`https://${this.clientOptions.location}-aiplatform.googleapis.com/`:"https://aiplatform.googleapis.com/"}normalizeAuthParameters(){if(this.clientOptions.project&&this.clientOptions.location)this.clientOptions.apiKey=void 0;else{this.clientOptions.project=void 0;this.clientOptions.location=void 0}}isVertexAI(){var e;return(e=this.clientOptions.vertexai)!==null&&e!==void 0&&e}getProject(){return this.clientOptions.project}getLocation(){return this.clientOptions.location}getApiVersion(){if(this.clientOptions.httpOptions&&this.clientOptions.httpOptions.apiVersion!==void 0)return this.clientOptions.httpOptions.apiVersion;throw new Error("API version is not set.")}getBaseUrl(){if(this.clientOptions.httpOptions&&this.clientOptions.httpOptions.baseUrl!==void 0)return this.clientOptions.httpOptions.baseUrl;throw new Error("Base URL is not set.")}getRequestUrl(){return this.getRequestUrlInternal(this.clientOptions.httpOptions)}getHeaders(){if(this.clientOptions.httpOptions&&this.clientOptions.httpOptions.headers!==void 0)return this.clientOptions.httpOptions.headers;throw new Error("Headers are not set.")}getRequestUrlInternal(e){if(!e||e.baseUrl===void 0||e.apiVersion===void 0)throw new Error("HTTP options are not correctly set.");const t=e.baseUrl.endsWith("/")?e.baseUrl.slice(0,-1):e.baseUrl;const n=[t];e.apiVersion&&e.apiVersion!==""&&n.push(e.apiVersion);return n.join("/")}getBaseResourcePath(){return`projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`}getApiKey(){return this.clientOptions.apiKey}getWebsocketBaseUrl(){const e=this.getBaseUrl();const t=new URL(e);t.protocol=t.protocol=="http:"?"ws":"wss";return t.toString()}setBaseUrl(e){if(!this.clientOptions.httpOptions)throw new Error("HTTP options are not correctly set.");this.clientOptions.httpOptions.baseUrl=e}constructUrl(e,t,n){const o=[this.getRequestUrlInternal(t)];n&&o.push(this.getBaseResourcePath());e!==""&&o.push(e);const s=new URL(`${o.join("/")}`);return s}shouldPrependVertexProjectPath(e){return!this.clientOptions.apiKey&&(!!this.clientOptions.vertexai&&(!e.path.startsWith("projects/")&&(e.httpMethod!=="GET"||!e.path.startsWith("publishers/google/models"))))}async request(e){let t=this.clientOptions.httpOptions;e.httpOptions&&(t=this.patchHttpOptions(this.clientOptions.httpOptions,e.httpOptions));const n=this.shouldPrependVertexProjectPath(e);const o=this.constructUrl(e.path,t,n);if(e.queryParams)for(const[t,n]of Object.entries(e.queryParams))o.searchParams.append(t,String(n));let s={};if(e.httpMethod==="GET"){if(e.body&&e.body!=="{}")throw new Error("Request body should be empty for GET request, but got non empty request body")}else s.body=e.body;s=await this.includeExtraHttpOptionsToRequestInit(s,t,o.toString(),e.abortSignal);return this.unaryApiCall(o,s,e.httpMethod)}patchHttpOptions(e,t){const n=JSON.parse(JSON.stringify(e));for(const[e,o]of Object.entries(t))typeof o==="object"?n[e]=Object.assign(Object.assign({},n[e]),o):o!==void 0&&(n[e]=o);return n}async requestStream(e){let t=this.clientOptions.httpOptions;e.httpOptions&&(t=this.patchHttpOptions(this.clientOptions.httpOptions,e.httpOptions));const n=this.shouldPrependVertexProjectPath(e);const o=this.constructUrl(e.path,t,n);o.searchParams.has("alt")&&o.searchParams.get("alt")==="sse"||o.searchParams.set("alt","sse");let s={};s.body=e.body;s=await this.includeExtraHttpOptionsToRequestInit(s,t,o.toString(),e.abortSignal);return this.streamApiCall(o,s,e.httpMethod)}async includeExtraHttpOptionsToRequestInit(e,t,n,o){if(t&&t.timeout||o){const n=new AbortController;const s=n.signal;if(t.timeout&&(t===null||t===void 0?void 0:t.timeout)>0){const e=setTimeout((()=>n.abort()),t.timeout);e&&typeof e.unref==="function"&&e.unref()}o&&o.addEventListener("abort",(()=>{n.abort()}));e.signal=s}t&&t.extraBody!==null&&Vi(e,t.extraBody);e.headers=await this.getHeadersInternal(t,n);return e}async unaryApiCall(e,t,n){return this.apiCall(e.toString(),Object.assign(Object.assign({},t),{method:n})).then((async e=>{await Hi(e);return new HttpResponse(e)})).catch((e=>{throw e instanceof Error?e:new Error(JSON.stringify(e))}))}async streamApiCall(e,t,n){return this.apiCall(e.toString(),Object.assign(Object.assign({},t),{method:n})).then((async e=>{await Hi(e);return this.processStreamResponse(e)})).catch((e=>{throw e instanceof Error?e:new Error(JSON.stringify(e))}))}processStreamResponse(e){var t;return Wn(this,arguments,(function*(){const n=(t=e===null||e===void 0?void 0:e.body)===null||t===void 0?void 0:t.getReader();const o=new TextDecoder("utf-8");if(!n)throw new Error("Response body is empty");try{let t="";while(true){const{done:s,value:i}=yield Yn(n.read());if(s){if(t.trim().length>0)throw new Error("Incomplete JSON segment at the end");break}const r=o.decode(i,{stream:true});try{const e=JSON.parse(r);if("error"in e){const t=JSON.parse(JSON.stringify(e.error));const n=t.status;const o=t.code;const s=`got status: ${n}. ${JSON.stringify(e)}`;if(o>=400&&o<600){const e=new ApiError({message:s,status:o});throw e}}}catch(e){const t=e;if(t.name==="ApiError")throw e}t+=r;let l=t.match(Fi);while(l){const n=l[1];try{const o=new Response(n,{headers:e===null||e===void 0?void 0:e.headers,status:e===null||e===void 0?void 0:e.status,statusText:e===null||e===void 0?void 0:e.statusText});yield yield Yn(new HttpResponse(o));t=t.slice(l[0].length);l=t.match(Fi)}catch(e){throw new Error(`exception parsing stream chunk ${n}. ${e}`)}}}}finally{n.releaseLock()}}))}async apiCall(e,t){return fetch(e,t).catch((e=>{throw new Error(`exception ${e} sending request`)}))}getDefaultHeaders(){const e={};const t=qi+" "+this.clientOptions.userAgentExtra;e[Ui]=t;e[ki]=t;e[Mi]="application/json";return e}async getHeadersInternal(e,t){const n=new Headers;if(e&&e.headers){for(const[t,o]of Object.entries(e.headers))n.append(t,o);e.timeout&&e.timeout>0&&n.append(Di,String(Math.ceil(e.timeout/1e3)))}await this.clientOptions.auth.addAuthHeaders(n,t);return n}getFileName(e){var t;let n="";if(typeof e==="string"){n=e.replace(/[/\\]+$/,"");n=(t=n.split(/[/\\]/).pop())!==null&&t!==void 0?t:""}return n}
/**
     * Uploads a file asynchronously using Gemini API only, this is not supported
     * in Vertex AI.
     *
     * @param file The string path to the file to be uploaded or a Blob object.
     * @param config Optional parameters specified in the `UploadFileConfig`
     *     interface. @see {@link types.UploadFileConfig}
     * @return A promise that resolves to a `File` object.
     * @throws An error if called on a Vertex AI client.
     * @throws An error if the `mimeType` is not provided and can not be inferred,
     */async uploadFile(e,t){var n;const o={};if(t!=null){o.mimeType=t.mimeType;o.name=t.name;o.displayName=t.displayName}o.name&&!o.name.startsWith("files/")&&(o.name=`files/${o.name}`);const s=this.clientOptions.uploader;const r=await s.stat(e);o.sizeBytes=String(r.size);const l=(n=t===null||t===void 0?void 0:t.mimeType)!==null&&n!==void 0?n:r.type;if(l===void 0||l==="")throw new Error("Can not determine mimeType. Please provide mimeType in the config.");o.mimeType=l;const a={file:o};const c=this.getFileName(e);const u=i("upload/v1beta/files",a._url);const p=await this.fetchUploadUrl(u,o.sizeBytes,o.mimeType,c,a,t===null||t===void 0?void 0:t.httpOptions);return s.upload(e,p,this)}
/**
     * Uploads a file to a given file search store asynchronously using Gemini API only, this is not supported
     * in Vertex AI.
     *
     * @param fileSearchStoreName The name of the file search store to upload the file to.
     * @param file The string path to the file to be uploaded or a Blob object.
     * @param config Optional parameters specified in the `UploadFileConfig`
     *     interface. @see {@link UploadFileConfig}
     * @return A promise that resolves to a `File` object.
     * @throws An error if called on a Vertex AI client.
     * @throws An error if the `mimeType` is not provided and can not be inferred,
     */async uploadFileToFileSearchStore(e,t,n){var o;const s=this.clientOptions.uploader;const i=await s.stat(t);const r=String(i.size);const l=(o=n===null||n===void 0?void 0:n.mimeType)!==null&&o!==void 0?o:i.type;if(l===void 0||l==="")throw new Error("Can not determine mimeType. Please provide mimeType in the config.");const a=`upload/v1beta/${e}:uploadToFileSearchStore`;const c=this.getFileName(t);const u={};(n===null||n===void 0?void 0:n.customMetadata)&&(u.customMetadata=n.customMetadata);(n===null||n===void 0?void 0:n.chunkingConfig)&&(u.chunkingConfig=n.chunkingConfig);const p=await this.fetchUploadUrl(a,r,l,c,u,n===null||n===void 0?void 0:n.httpOptions);return s.uploadToFileSearchStore(t,p,this)}
/**
     * Downloads a file asynchronously to the specified path.
     *
     * @params params - The parameters for the download request, see {@link
     * types.DownloadFileParameters}
     */async downloadFile(e){const t=this.clientOptions.downloader;await t.download(e,this)}async fetchUploadUrl(e,t,n,o,s,i){var r;let l={};l=i||{apiVersion:"",headers:Object.assign({"Content-Type":"application/json","X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${t}`,"X-Goog-Upload-Header-Content-Type":`${n}`},o?{"X-Goog-Upload-File-Name":o}:{})};const a=await this.request({path:e,body:JSON.stringify(s),httpMethod:"POST",httpOptions:l});if(!a||!(a===null||a===void 0?void 0:a.headers))throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");const c=(r=a===null||a===void 0?void 0:a.headers)===null||r===void 0?void 0:r["x-goog-upload-url"];if(c===void 0)throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");return c}}async function Hi(e){var t;if(e===void 0)throw new Error("response is undefined");if(!e.ok){const n=e.status;let o;o=((t=e.headers.get("content-type"))===null||t===void 0?void 0:t.includes("application/json"))?await e.json():{error:{message:await e.text(),code:e.status,status:e.statusText}};const s=JSON.stringify(o);if(n>=400&&n<600){const e=new ApiError({message:s,status:n});throw e}throw new Error(s)}}
/**
 * Recursively updates the `requestInit.body` with values from an `extraBody` object.
 *
 * If `requestInit.body` is a string, it's assumed to be JSON and will be parsed.
 * The `extraBody` is then deeply merged into this parsed object.
 * If `requestInit.body` is a Blob, `extraBody` will be ignored, and a warning logged,
 * as merging structured data into an opaque Blob is not supported.
 *
 * The function does not enforce that updated values from `extraBody` have the
 * same type as existing values in `requestInit.body`. Type mismatches during
 * the merge will result in a warning, but the value from `extraBody` will overwrite
 * the original. `extraBody` users are responsible for ensuring `extraBody` has the correct structure.
 *
 * @param requestInit The RequestInit object whose body will be updated.
 * @param extraBody The object containing updates to be merged into `requestInit.body`.
 */function Vi(e,t){if(!t||Object.keys(t).length===0)return;if(e.body instanceof Blob){console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");return}let n={};if(typeof e.body==="string"&&e.body.length>0)try{const t=JSON.parse(e.body);if(typeof t!=="object"||t===null||Array.isArray(t)){console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");return}
/*  eslint-disable-next-line @typescript-eslint/no-unused-vars */n=t}catch(e){console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");return}function o(e,t){const n=Object.assign({},e);for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e)){const s=t[e];const i=n[e];if(s&&typeof s==="object"&&!Array.isArray(s)&&i&&typeof i==="object"&&!Array.isArray(i))n[e]=o(i,s);else{i&&s&&typeof i!==typeof s&&console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${e}". Original type: ${typeof i}, New type: ${typeof s}. Overwriting.`);n[e]=s}}return n}const s=o(n,t);e.body=JSON.stringify(s)}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const ji="mcp_used/unknown";let Bi=false;function Ji(e){for(const t of e){if(Wi(t))return true;if(typeof t==="object"&&"inputSchema"in t)return true}return Bi}function Yi(e){var t;const n=(t=e[ki])!==null&&t!==void 0?t:"";e[ki]=(n+` ${ji}`).trimStart()}function Wi(e){return e!==null&&typeof e==="object"&&e instanceof McpCallableTool}function Ki(e,t=100){return Wn(this,arguments,(function*(){let n;let o=0;while(o<t){const t=yield Yn(e.listTools({cursor:n}));for(const e of t.tools){yield yield Yn(e);o++}if(!t.nextCursor)break;n=t.nextCursor}}))}class McpCallableTool{constructor(e=[],t){this.mcpTools=[];this.functionNameToMcpClient={};this.mcpClients=e;this.config=t}static create(e,t){return new McpCallableTool(e,t)}async initialize(){var e,t,n,o;if(this.mcpTools.length>0)return;const s={};const i=[];for(const c of this.mcpClients)try{for(var r,l=true,a=(t=void 0,Kn(Ki(c)));r=await a.next(),e=r.done,!e;l=true){o=r.value;l=false;const e=o;i.push(e);const t=e.name;if(s[t])throw new Error(`Duplicate function name ${t} found in MCP tools. Please ensure function names are unique.`);s[t]=c}}catch(e){t={error:e}}finally{try{l||e||!(n=a.return)||await n.call(a)}finally{if(t)throw t.error}}this.mcpTools=i;this.functionNameToMcpClient=s}async tool(){await this.initialize();return vt(this.mcpTools,this.config)}async callTool(e){await this.initialize();const t=[];for(const n of e)if(n.name in this.functionNameToMcpClient){const e=this.functionNameToMcpClient[n.name];let o;this.config.timeout&&(o={timeout:this.config.timeout});const s=await e.callTool({name:n.name,arguments:n.args},void 0,o);t.push({functionResponse:{name:n.name,response:s.isError?{error:s}:s}})}return t}}function $i(e){return e!==null&&typeof e==="object"&&"listTools"in e&&typeof e.listTools==="function"}function zi(...e){Bi=true;if(e.length===0)throw new Error("No MCP clients provided");const t=e[e.length-1];return $i(t)?McpCallableTool.create(e,{}):McpCallableTool.create(e.slice(0,e.length-1),t)}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Handles incoming messages from the WebSocket.
 *
 * @remarks
 * This function is responsible for parsing incoming messages, transforming them
 * into LiveMusicServerMessage, and then calling the onmessage callback.
 * Note that the first message which is received from the server is a
 * setupComplete message.
 *
 * @param apiClient The ApiClient instance.
 * @param onmessage The user-provided onmessage callback (if any).
 * @param event The MessageEvent from the WebSocket.
 */async function Xi(e,t,n){const o=new LiveMusicServerMessage;let s;s=n.data instanceof Blob?JSON.parse(await n.data.text()):JSON.parse(n.data);Object.assign(o,s);t(o)}class LiveMusic{constructor(e,t,n){this.apiClient=e;this.auth=t;this.webSocketFactory=n}
/**
       Establishes a connection to the specified model and returns a
       LiveMusicSession object representing that connection.
  
       @experimental
  
       @remarks
  
       @param params - The parameters for establishing a connection to the model.
       @return A live session.
  
       @example
       ```ts
       let model = 'models/lyria-realtime-exp';
       const session = await ai.live.music.connect({
         model: model,
         callbacks: {
           onmessage: (e: MessageEvent) => {
             console.log('Received message from the server: %s\n', debug(e.data));
           },
           onerror: (e: ErrorEvent) => {
             console.log('Error occurred: %s\n', debug(e.error));
           },
           onclose: (e: CloseEvent) => {
             console.log('Connection closed.');
           },
         },
       });
       ```
      */async connect(e){var t,n;if(this.apiClient.isVertexAI())throw new Error("Live music is not supported for Vertex AI.");console.warn("Live music generation is experimental and may change in future versions.");const o=this.apiClient.getWebsocketBaseUrl();const s=this.apiClient.getApiVersion();const i=Zi(this.apiClient.getDefaultHeaders());const r=this.apiClient.getApiKey();const l=`${o}/ws/google.ai.generativelanguage.${s}.GenerativeService.BidiGenerateMusic?key=${r}`;let a=()=>{};const c=new Promise((e=>{a=e}));const u=e.callbacks;const p=function(){a({})};const d=this.apiClient;const h={onopen:p,onmessage:e=>{void Xi(d,u.onmessage,e)},onerror:(t=u===null||u===void 0?void 0:u.onerror)!==null&&t!==void 0?t:function(e){},onclose:(n=u===null||u===void 0?void 0:u.onclose)!==null&&n!==void 0?n:function(e){}};const f=this.webSocketFactory.create(l,Qi(i),h);f.connect();await c;const m=xe(this.apiClient,e.model);const g={model:m};const v={setup:g};f.send(JSON.stringify(v));return new LiveMusicSession(f,this.apiClient)}}class LiveMusicSession{constructor(e,t){this.conn=e;this.apiClient=t}
/**
      Sets inputs to steer music generation. Updates the session's current
      weighted prompts.
  
      @param params - Contains one property, `weightedPrompts`.
  
        - `weightedPrompts` to send to the model; weights are normalized to
          sum to 1.0.
  
      @experimental
     */async setWeightedPrompts(e){if(!e.weightedPrompts||Object.keys(e.weightedPrompts).length===0)throw new Error("Weighted prompts must be set and contain at least one entry.");const t=_o(e);this.conn.send(JSON.stringify({clientContent:t}))}
/**
      Sets a configuration to the model. Updates the session's current
      music generation config.
  
      @param params - Contains one property, `musicGenerationConfig`.
  
        - `musicGenerationConfig` to set in the model. Passing an empty or
      undefined config to the model will reset the config to defaults.
  
      @experimental
     */async setMusicGenerationConfig(e){e.musicGenerationConfig||(e.musicGenerationConfig={});const t=Eo(e);this.conn.send(JSON.stringify(t))}sendPlaybackControl(e){const t={playbackControl:e};this.conn.send(JSON.stringify(t))}play(){this.sendPlaybackControl(Ae.PLAY)}pause(){this.sendPlaybackControl(Ae.PAUSE)}stop(){this.sendPlaybackControl(Ae.STOP)}resetContext(){this.sendPlaybackControl(Ae.RESET_CONTEXT)}close(){this.conn.close()}}function Qi(e){const t={};e.forEach(((e,n)=>{t[n]=e}));return t}function Zi(e){const t=new Headers;for(const[n,o]of Object.entries(e))t.append(n,o);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const er="FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
/**
 * Handles incoming messages from the WebSocket.
 *
 * @remarks
 * This function is responsible for parsing incoming messages, transforming them
 * into LiveServerMessages, and then calling the onmessage callback. Note that
 * the first message which is received from the server is a setupComplete
 * message.
 *
 * @param apiClient The ApiClient instance.
 * @param onmessage The user-provided onmessage callback (if any).
 * @param event The MessageEvent from the WebSocket.
 */async function tr(e,t,n){const o=new LiveServerMessage;let s;s=n.data instanceof Blob?await n.data.text():n.data instanceof ArrayBuffer?(new TextDecoder).decode(n.data):n.data;const i=JSON.parse(s);if(e.isVertexAI()){const e=Co(i);Object.assign(o,e)}else{const e=i;Object.assign(o,e)}t(o)}class Live{constructor(e,t,n){this.apiClient=e;this.auth=t;this.webSocketFactory=n;this.music=new LiveMusic(this.apiClient,this.auth,this.webSocketFactory)}
/**
       Establishes a connection to the specified model with the given
       configuration and returns a Session object representing that connection.
  
       @experimental Built-in MCP support is an experimental feature, may change in
       future versions.
  
       @remarks
  
       @param params - The parameters for establishing a connection to the model.
       @return A live session.
  
       @example
       ```ts
       let model: string;
       if (GOOGLE_GENAI_USE_VERTEXAI) {
         model = 'gemini-2.0-flash-live-preview-04-09';
       } else {
         model = 'gemini-live-2.5-flash-preview';
       }
       const session = await ai.live.connect({
         model: model,
         config: {
           responseModalities: [Modality.AUDIO],
         },
         callbacks: {
           onopen: () => {
             console.log('Connected to the socket.');
           },
           onmessage: (e: MessageEvent) => {
             console.log('Received message from the server: %s\n', debug(e.data));
           },
           onerror: (e: ErrorEvent) => {
             console.log('Error occurred: %s\n', debug(e.error));
           },
           onclose: (e: CloseEvent) => {
             console.log('Connection closed.');
           },
         },
       });
       ```
      */async connect(e){var t,n,o,s,i,r;if(e.config&&e.config.httpOptions)throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");const l=this.apiClient.getWebsocketBaseUrl();const a=this.apiClient.getApiVersion();let c;const u=this.apiClient.getHeaders();e.config&&e.config.tools&&Ji(e.config.tools)&&Yi(u);const p=sr(u);if(this.apiClient.isVertexAI()){c=`${l}/ws/google.cloud.aiplatform.${a}.LlmBidiService/BidiGenerateContent`;await this.auth.addAuthHeaders(p,c)}else{const e=this.apiClient.getApiKey();let t="BidiGenerateContent";let n="key";if(e===null||e===void 0?void 0:e.startsWith("auth_tokens/")){console.warn("Warning: Ephemeral token support is experimental and may change in future versions.");a!=="v1alpha"&&console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection.");t="BidiGenerateContentConstrained";n="access_token"}c=`${l}/ws/google.ai.generativelanguage.${a}.GenerativeService.${t}?${n}=${e}`}let d=()=>{};const h=new Promise((e=>{d=e}));const f=e.callbacks;const m=function(){var e;(e=f===null||f===void 0?void 0:f.onopen)===null||e===void 0?void 0:e.call(f);d({})};const g=this.apiClient;const v={onopen:m,onmessage:e=>{void tr(g,f.onmessage,e)},onerror:(t=f===null||f===void 0?void 0:f.onerror)!==null&&t!==void 0?t:function(e){},onclose:(n=f===null||f===void 0?void 0:f.onclose)!==null&&n!==void 0?n:function(e){}};const y=this.webSocketFactory.create(c,or(p),v);y.connect();await h;let E=xe(this.apiClient,e.model);if(this.apiClient.isVertexAI()&&E.startsWith("publishers/")){const e=this.apiClient.getProject();const t=this.apiClient.getLocation();E=`projects/${e}/locations/${t}/`+E}let _={};this.apiClient.isVertexAI()&&((o=e.config)===null||o===void 0?void 0:o.responseModalities)===void 0&&(e.config===void 0?e.config={responseModalities:[B.AUDIO]}:e.config.responseModalities=[B.AUDIO]);((s=e.config)===null||s===void 0?void 0:s.generationConfig)&&console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");const I=(r=(i=e.config)===null||i===void 0?void 0:i.tools)!==null&&r!==void 0?r:[];const T=[];for(const e of I)if(this.isCallableTool(e)){const t=e;T.push(await t.tool())}else T.push(e);T.length>0&&(e.config.tools=T);const C={model:E,config:e.config,callbacks:e.callbacks};_=this.apiClient.isVertexAI()?yo(this.apiClient,C):vo(this.apiClient,C);delete _.config;y.send(JSON.stringify(_));return new Session(y,this.apiClient)}isCallableTool(e){return"callTool"in e&&typeof e.callTool==="function"}}const nr={turnComplete:true};class Session{constructor(e,t){this.conn=e;this.apiClient=t}tLiveClientContent(e,t){if(t.turns!==null&&t.turns!==void 0){let n=[];try{n=Xe(t.turns);e.isVertexAI()||(n=n.map((e=>qo(e))))}catch(e){throw new Error(`Failed to parse client content "turns", type: '${typeof t.turns}'`)}return{clientContent:{turns:n,turnComplete:t.turnComplete}}}return{clientContent:{turnComplete:t.turnComplete}}}tLiveClienttToolResponse(e,t){let n=[];if(t.functionResponses==null)throw new Error("functionResponses is required.");n=Array.isArray(t.functionResponses)?t.functionResponses:[t.functionResponses];if(n.length===0)throw new Error("functionResponses is required.");for(const t of n){if(typeof t!=="object"||t===null||!("name"in t)||!("response"in t))throw new Error(`Could not parse function response, type '${typeof t}'.`);if(!e.isVertexAI()&&!("id"in t))throw new Error(er)}const o={toolResponse:{functionResponses:n}};return o}
/**
      Send a message over the established connection.
  
      @param params - Contains two **optional** properties, `turns` and
          `turnComplete`.
  
        - `turns` will be converted to a `Content[]`
        - `turnComplete: true` [default] indicates that you are done sending
          content and expect a response. If `turnComplete: false`, the server
          will wait for additional messages before starting generation.
  
      @experimental
  
      @remarks
      There are two ways to send messages to the live API:
      `sendClientContent` and `sendRealtimeInput`.
  
      `sendClientContent` messages are added to the model context **in order**.
      Having a conversation using `sendClientContent` messages is roughly
      equivalent to using the `Chat.sendMessageStream`, except that the state of
      the `chat` history is stored on the API server instead of locally.
  
      Because of `sendClientContent`'s order guarantee, the model cannot respons
      as quickly to `sendClientContent` messages as to `sendRealtimeInput`
      messages. This makes the biggest difference when sending objects that have
      significant preprocessing time (typically images).
  
      The `sendClientContent` message sends a `Content[]`
      which has more options than the `Blob` sent by `sendRealtimeInput`.
  
      So the main use-cases for `sendClientContent` over `sendRealtimeInput` are:
  
      - Sending anything that can't be represented as a `Blob` (text,
      `sendClientContent({turns="Hello?"}`)).
      - Managing turns when not using audio input and voice activity detection.
        (`sendClientContent({turnComplete:true})` or the short form
      `sendClientContent()`)
      - Prefilling a conversation context
        ```
        sendClientContent({
            turns: [
              Content({role:user, parts:...}),
              Content({role:user, parts:...}),
              ...
            ]
        })
        ```
      @experimental
     */sendClientContent(e){e=Object.assign(Object.assign({},nr),e);const t=this.tLiveClientContent(this.apiClient,e);this.conn.send(JSON.stringify(t))}
/**
      Send a realtime message over the established connection.
  
      @param params - Contains one property, `media`.
  
        - `media` will be converted to a `Blob`
  
      @experimental
  
      @remarks
      Use `sendRealtimeInput` for realtime audio chunks and video frames (images).
  
      With `sendRealtimeInput` the api will respond to audio automatically
      based on voice activity detection (VAD).
  
      `sendRealtimeInput` is optimized for responsivness at the expense of
      deterministic ordering guarantees. Audio and video tokens are to the
      context when they become available.
  
      Note: The Call signature expects a `Blob` object, but only a subset
      of audio and image mimetypes are allowed.
     */sendRealtimeInput(e){let t={};t=this.apiClient.isVertexAI()?{realtimeInput:To(e)}:{realtimeInput:Io(e)};this.conn.send(JSON.stringify(t))}
/**
      Send a function response message over the established connection.
  
      @param params - Contains property `functionResponses`.
  
        - `functionResponses` will be converted to a `functionResponses[]`
  
      @remarks
      Use `sendFunctionResponse` to reply to `LiveServerToolCall` from the server.
  
      Use {@link types.LiveConnectConfig#tools} to configure the callable functions.
  
      @experimental
     */sendToolResponse(e){if(e.functionResponses==null)throw new Error("Tool response parameters are required.");const t=this.tLiveClienttToolResponse(this.apiClient,e);this.conn.send(JSON.stringify(t))}close(){this.conn.close()}}function or(e){const t={};e.forEach(((e,n)=>{t[n]=e}));return t}function sr(e){const t=new Headers;for(const[n,o]of Object.entries(e))t.append(n,o);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const ir=10;function rr(e){var t,n,o;if((t=e===null||e===void 0?void 0:e.automaticFunctionCalling)===null||t===void 0?void 0:t.disable)return true;let s=false;for(const t of(n=e===null||e===void 0?void 0:e.tools)!==null&&n!==void 0?n:[])if(lr(t)){s=true;break}if(!s)return true;const i=(o=e===null||e===void 0?void 0:e.automaticFunctionCalling)===null||o===void 0?void 0:o.maximumRemoteCalls;if(i&&(i<0||!Number.isInteger(i))||i==0){console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:",i);return true}return false}function lr(e){return"callTool"in e&&typeof e.callTool==="function"}function ar(e){var t,n,o;return(o=(n=(t=e.config)===null||t===void 0?void 0:t.tools)===null||n===void 0?void 0:n.some((e=>lr(e))))!==null&&o!==void 0&&o}function cr(e){var t;const n=[];if(!((t=e===null||e===void 0?void 0:e.config)===null||t===void 0?void 0:t.tools))return n;e.config.tools.forEach(((e,t)=>{if(lr(e))return;const o=e;o.functionDeclarations&&o.functionDeclarations.length>0&&n.push(t)}));return n}function ur(e){var t;return!((t=e===null||e===void 0?void 0:e.automaticFunctionCalling)===null||t===void 0?void 0:t.ignoreCallHistory)}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Models extends BaseModule{constructor(e){super();this.apiClient=e;
/**
         * Makes an API request to generate content with a given model.
         *
         * For the `model` parameter, supported formats for Vertex AI API include:
         * - The Gemini model ID, for example: 'gemini-2.0-flash'
         * - The full resource name starts with 'projects/', for example:
         *  'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
         * - The partial resource name with 'publishers/', for example:
         *  'publishers/google/models/gemini-2.0-flash' or
         *  'publishers/meta/models/llama-3.1-405b-instruct-maas'
         * - `/` separated publisher and model name, for example:
         * 'google/gemini-2.0-flash' or 'meta/llama-3.1-405b-instruct-maas'
         *
         * For the `model` parameter, supported formats for Gemini API include:
         * - The Gemini model ID, for example: 'gemini-2.0-flash'
         * - The model name starts with 'models/', for example:
         *  'models/gemini-2.0-flash'
         * - For tuned models, the model name starts with 'tunedModels/',
         * for example:
         * 'tunedModels/1234567890123456789'
         *
         * Some models support multimodal input and output.
         *
         * @param params - The parameters for generating content.
         * @return The response from generating content.
         *
         * @example
         * ```ts
         * const response = await ai.models.generateContent({
         *   model: 'gemini-2.0-flash',
         *   contents: 'why is the sky blue?',
         *   config: {
         *     candidateCount: 2,
         *   }
         * });
         * console.log(response);
         * ```
         */this.generateContent=async e=>{var t,n,o,s,i;const r=await this.processParamsMaybeAddMcpUsage(e);this.maybeMoveToResponseJsonSchem(e);if(!ar(e)||rr(e.config))return await this.generateContentInternal(r);const l=cr(e);if(l.length>0){const e=l.map((e=>`tools[${e}]`)).join(", ");throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${e}.`)}let a;let c;const u=Xe(r.contents);const p=(o=(n=(t=r.config)===null||t===void 0?void 0:t.automaticFunctionCalling)===null||n===void 0?void 0:n.maximumRemoteCalls)!==null&&o!==void 0?o:ir;let d=0;while(d<p){a=await this.generateContentInternal(r);if(!a.functionCalls||a.functionCalls.length===0)break;const t=a.candidates[0].content;const n=[];for(const t of(i=(s=e.config)===null||s===void 0?void 0:s.tools)!==null&&i!==void 0?i:[])if(lr(t)){const e=t;const o=await e.callTool(a.functionCalls);n.push(...o)}d++;c={role:"user",parts:n};r.contents=Xe(r.contents);r.contents.push(t);r.contents.push(c);if(ur(r.config)){u.push(t);u.push(c)}}ur(r.config)&&(a.automaticFunctionCallingHistory=u);return a};
/**
         * Makes an API request to generate content with a given model and yields the
         * response in chunks.
         *
         * For the `model` parameter, supported formats for Vertex AI API include:
         * - The Gemini model ID, for example: 'gemini-2.0-flash'
         * - The full resource name starts with 'projects/', for example:
         *  'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
         * - The partial resource name with 'publishers/', for example:
         *  'publishers/google/models/gemini-2.0-flash' or
         *  'publishers/meta/models/llama-3.1-405b-instruct-maas'
         * - `/` separated publisher and model name, for example:
         * 'google/gemini-2.0-flash' or 'meta/llama-3.1-405b-instruct-maas'
         *
         * For the `model` parameter, supported formats for Gemini API include:
         * - The Gemini model ID, for example: 'gemini-2.0-flash'
         * - The model name starts with 'models/', for example:
         *  'models/gemini-2.0-flash'
         * - For tuned models, the model name starts with 'tunedModels/',
         * for example:
         *  'tunedModels/1234567890123456789'
         *
         * Some models support multimodal input and output.
         *
         * @param params - The parameters for generating content with streaming response.
         * @return The response from generating content.
         *
         * @example
         * ```ts
         * const response = await ai.models.generateContentStream({
         *   model: 'gemini-2.0-flash',
         *   contents: 'why is the sky blue?',
         *   config: {
         *     maxOutputTokens: 200,
         *   }
         * });
         * for await (const chunk of response) {
         *   console.log(chunk);
         * }
         * ```
         */this.generateContentStream=async e=>{this.maybeMoveToResponseJsonSchem(e);if(rr(e.config)){const t=await this.processParamsMaybeAddMcpUsage(e);return await this.generateContentStreamInternal(t)}const t=cr(e);if(t.length>0){const e=t.map((e=>`tools[${e}]`)).join(", ");throw new Error(`Incompatible tools found at ${e}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`)}return await this.processAfcStream(e)};
/**
         * Generates an image based on a text description and configuration.
         *
         * @param params - The parameters for generating images.
         * @return The response from the API.
         *
         * @example
         * ```ts
         * const response = await client.models.generateImages({
         *  model: 'imagen-3.0-generate-002',
         *  prompt: 'Robot holding a red skateboard',
         *  config: {
         *    numberOfImages: 1,
         *    includeRaiReason: true,
         *  },
         * });
         * console.log(response?.generatedImages?.[0]?.image?.imageBytes);
         * ```
         */this.generateImages=async e=>await this.generateImagesInternal(e).then((e=>{var t;let n;const o=[];if(e===null||e===void 0?void 0:e.generatedImages)for(const s of e.generatedImages)s&&(s===null||s===void 0?void 0:s.safetyAttributes)&&((t=s===null||s===void 0?void 0:s.safetyAttributes)===null||t===void 0?void 0:t.contentType)==="Positive Prompt"?n=s===null||s===void 0?void 0:s.safetyAttributes:o.push(s);let s;s=n?{generatedImages:o,positivePromptSafetyAttributes:n,sdkHttpResponse:e.sdkHttpResponse}:{generatedImages:o,sdkHttpResponse:e.sdkHttpResponse};return s}));this.list=async e=>{var t;const n={queryBase:true};const o=Object.assign(Object.assign({},n),e===null||e===void 0?void 0:e.config);const s={config:o};if(this.apiClient.isVertexAI()&&!s.config.queryBase){if((t=s.config)===null||t===void 0?void 0:t.filter)throw new Error("Filtering tuned models list for Vertex AI is not currently supported");s.config.filter="labels.tune-type:*"}return new Pager(mn.PAGED_ITEM_MODELS,(e=>this.listInternal(e)),await this.listInternal(s),s)};
/**
         * Edits an image based on a prompt, list of reference images, and configuration.
         *
         * @param params - The parameters for editing an image.
         * @return The response from the API.
         *
         * @example
         * ```ts
         * const response = await client.models.editImage({
         *  model: 'imagen-3.0-capability-001',
         *  prompt: 'Generate an image containing a mug with the product logo [1] visible on the side of the mug.',
         *  referenceImages: [subjectReferenceImage]
         *  config: {
         *    numberOfImages: 1,
         *    includeRaiReason: true,
         *  },
         * });
         * console.log(response?.generatedImages?.[0]?.image?.imageBytes);
         * ```
         */this.editImage=async e=>{const t={model:e.model,prompt:e.prompt,referenceImages:[],config:e.config};e.referenceImages&&e.referenceImages&&(t.referenceImages=e.referenceImages.map((e=>e.toReferenceImageAPI())));return await this.editImageInternal(t)};
/**
         * Upscales an image based on an image, upscale factor, and configuration.
         * Only supported in Vertex AI currently.
         *
         * @param params - The parameters for upscaling an image.
         * @return The response from the API.
         *
         * @example
         * ```ts
         * const response = await client.models.upscaleImage({
         *  model: 'imagen-3.0-generate-002',
         *  image: image,
         *  upscaleFactor: 'x2',
         *  config: {
         *    includeRaiReason: true,
         *  },
         * });
         * console.log(response?.generatedImages?.[0]?.image?.imageBytes);
         * ```
         */this.upscaleImage=async e=>{let t={numberOfImages:1,mode:"upscale"};e.config&&(t=Object.assign(Object.assign({},t),e.config));const n={model:e.model,image:e.image,upscaleFactor:e.upscaleFactor,config:t};return await this.upscaleImageInternal(n)};
/**
         *  Generates videos based on a text description and configuration.
         *
         * @param params - The parameters for generating videos.
         * @return A Promise<GenerateVideosOperation> which allows you to track the progress and eventually retrieve the generated videos using the operations.get method.
         *
         * @example
         * ```ts
         * const operation = await ai.models.generateVideos({
         *  model: 'veo-2.0-generate-001',
         *  source: {
         *    prompt: 'A neon hologram of a cat driving at top speed',
         *  },
         *  config: {
         *    numberOfVideos: 1
         * });
         *
         * while (!operation.done) {
         *   await new Promise(resolve => setTimeout(resolve, 10000));
         *   operation = await ai.operations.getVideosOperation({operation: operation});
         * }
         *
         * console.log(operation.response?.generatedVideos?.[0]?.video?.uri);
         * ```
         */this.generateVideos=async e=>{var t,n,o,s,i,r;if((e.prompt||e.image||e.video)&&e.source)throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");this.apiClient.isVertexAI()||(((t=e.video)===null||t===void 0?void 0:t.uri)&&((n=e.video)===null||n===void 0?void 0:n.videoBytes)?e.video={uri:e.video.uri,mimeType:e.video.mimeType}:((s=(o=e.source)===null||o===void 0?void 0:o.video)===null||s===void 0?void 0:s.uri)&&((r=(i=e.source)===null||i===void 0?void 0:i.video)===null||r===void 0?void 0:r.videoBytes)&&(e.source.video={uri:e.source.video.uri,mimeType:e.source.video.mimeType}));return await this.generateVideosInternal(e)}}maybeMoveToResponseJsonSchem(e){if(e.config&&e.config.responseSchema&&!e.config.responseJsonSchema&&Object.keys(e.config.responseSchema).includes("$schema")){e.config.responseJsonSchema=e.config.responseSchema;delete e.config.responseSchema}}async processParamsMaybeAddMcpUsage(e){var t,n,o;const s=(t=e.config)===null||t===void 0?void 0:t.tools;if(!s)return e;const i=await Promise.all(s.map((async e=>{if(lr(e)){const t=e;return await t.tool()}return e})));const r={model:e.model,contents:e.contents,config:Object.assign(Object.assign({},e.config),{tools:i})};r.config.tools=i;if(e.config&&e.config.tools&&Ji(e.config.tools)){const t=(o=(n=e.config.httpOptions)===null||n===void 0?void 0:n.headers)!==null&&o!==void 0?o:{};let s=Object.assign({},t);Object.keys(s).length===0&&(s=this.apiClient.getDefaultHeaders());Yi(s);r.config.httpOptions=Object.assign(Object.assign({},e.config.httpOptions),{headers:s})}return r}async initAfcToolsMap(e){var t,n,o;const s=new Map;for(const i of(n=(t=e.config)===null||t===void 0?void 0:t.tools)!==null&&n!==void 0?n:[])if(lr(i)){const e=i;const t=await e.tool();for(const n of(o=t.functionDeclarations)!==null&&o!==void 0?o:[]){if(!n.name)throw new Error("Function declaration name is required.");if(s.has(n.name))throw new Error(`Duplicate tool declaration name: ${n.name}`);s.set(n.name,e)}}return s}async processAfcStream(e){var t,n,o;const s=(o=(n=(t=e.config)===null||t===void 0?void 0:t.automaticFunctionCalling)===null||n===void 0?void 0:n.maximumRemoteCalls)!==null&&o!==void 0?o:ir;let i=false;let r=0;const l=await this.initAfcToolsMap(e);return function(e,t,n){var o,l;return Wn(this,arguments,(function*(){var a,c,u,p;while(r<s){if(i){r++;i=false}const m=yield Yn(e.processParamsMaybeAddMcpUsage(n));const g=yield Yn(e.generateContentStreamInternal(m));const v=[];const y=[];try{for(var d,h=true,f=(c=void 0,Kn(g));d=yield Yn(f.next()),a=d.done,!a;h=true){p=d.value;h=false;const e=p;yield yield Yn(e);if(e.candidates&&((o=e.candidates[0])===null||o===void 0?void 0:o.content)){y.push(e.candidates[0].content);for(const n of(l=e.candidates[0].content.parts)!==null&&l!==void 0?l:[])if(r<s&&n.functionCall){if(!n.functionCall.name)throw new Error("Function call name was not returned by the model.");if(!t.has(n.functionCall.name))throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${t.keys()}, mising tool: ${n.functionCall.name}`);{const e=yield Yn(t.get(n.functionCall.name).callTool([n.functionCall]));v.push(...e)}}}}}catch(e){c={error:e}}finally{try{h||a||!(u=f.return)||(yield Yn(u.call(f)))}finally{if(c)throw c.error}}if(!(v.length>0))break;{i=true;const e=new GenerateContentResponse;e.candidates=[{content:{role:"user",parts:v}}];yield yield Yn(e);const t=[];t.push(...y);t.push({role:"user",parts:v});const o=Xe(n.contents).concat(t);n.contents=o}}}))}(this,l,e)}async generateContentInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=us(this.apiClient,e);l=i("{model}:generateContent",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=ds(e);const n=new GenerateContentResponse;Object.assign(n,t);return n}))}{const t=cs(this.apiClient,e);l=i("{model}:generateContent",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=ps(e);const n=new GenerateContentResponse;Object.assign(n,t);return n}))}}async generateContentStreamInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=us(this.apiClient,e);l=i("{model}:streamGenerateContent?alt=sse",o._url);a=o._query;delete o._url;delete o._query;const s=this.apiClient;r=s.requestStream({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal});return r.then((function(e){return Wn(this,arguments,(function*(){var t,n,o,s;try{for(var i,r=true,l=Kn(e);i=yield Yn(l.next()),t=i.done,!t;r=true){s=i.value;r=false;const e=s;const t=ds(yield Yn(e.json()));t.sdkHttpResponse={headers:e.headers};const n=new GenerateContentResponse;Object.assign(n,t);yield yield Yn(n)}}catch(e){n={error:e}}finally{try{r||t||!(o=l.return)||(yield Yn(o.call(l)))}finally{if(n)throw n.error}}}))}))}{const t=cs(this.apiClient,e);l=i("{model}:streamGenerateContent?alt=sse",t._url);a=t._query;delete t._url;delete t._query;const n=this.apiClient;r=n.requestStream({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal});return r.then((function(e){return Wn(this,arguments,(function*(){var t,n,o,s;try{for(var i,r=true,l=Kn(e);i=yield Yn(l.next()),t=i.done,!t;r=true){s=i.value;r=false;const e=s;const t=ps(yield Yn(e.json()));t.sdkHttpResponse={headers:e.headers};const n=new GenerateContentResponse;Object.assign(n,t);yield yield Yn(n)}}catch(e){n={error:e}}finally{try{r||t||!(o=l.return)||(yield Yn(o.call(l)))}finally{if(n)throw n.error}}}))}))}}
/**
     * Calculates embeddings for the given contents. Only text is supported.
     *
     * @param params - The parameters for embedding contents.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.embedContent({
     *  model: 'text-embedding-004',
     *  contents: [
     *    'What is your name?',
     *    'What is your favorite color?',
     *  ],
     *  config: {
     *    outputDimensionality: 64,
     *  },
     * });
     * console.log(response);
     * ```
     */async embedContent(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=ts(this.apiClient,e);l=i("{model}:predict",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=os(e);const n=new EmbedContentResponse;Object.assign(n,t);return n}))}{const t=es(this.apiClient,e);l=i("{model}:batchEmbedContents",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=ns(e);const n=new EmbedContentResponse;Object.assign(n,t);return n}))}}async generateImagesInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=gs(this.apiClient,e);l=i("{model}:predict",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=ys(e);const n=new GenerateImagesResponse;Object.assign(n,t);return n}))}{const t=ms(this.apiClient,e);l=i("{model}:predict",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=vs(e);const n=new GenerateImagesResponse;Object.assign(n,t);return n}))}}async editImageInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=zo(this.apiClient,e);s=i("{model}:predict",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=Xo(e);const n=new EditImageResponse;Object.assign(n,t);return n}))}throw new Error("This method is only supported by the Vertex AI.")}async upscaleImageInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=Ci(this.apiClient,e);s=i("{model}:predict",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=Ai(e);const n=new UpscaleImageResponse;Object.assign(n,t);return n}))}throw new Error("This method is only supported by the Vertex AI.")}
/**
     * Recontextualizes an image.
     *
     * There are two types of recontextualization currently supported:
     * 1) Imagen Product Recontext - Generate images of products in new scenes
     *    and contexts.
     * 2) Virtual Try-On: Generate images of persons modeling fashion products.
     *
     * @param params - The parameters for recontextualizing an image.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response1 = await ai.models.recontextImage({
     *  model: 'imagen-product-recontext-preview-06-30',
     *  source: {
     *    prompt: 'In a modern kitchen setting.',
     *    productImages: [productImage],
     *  },
     *  config: {
     *    numberOfImages: 1,
     *  },
     * });
     * console.log(response1?.generatedImages?.[0]?.image?.imageBytes);
     *
     * const response2 = await ai.models.recontextImage({
     *  model: 'virtual-try-on-preview-08-04',
     *  source: {
     *    personImage: personImage,
     *    productImages: [productImage],
     *  },
     *  config: {
     *    numberOfImages: 1,
     *  },
     * });
     * console.log(response2?.generatedImages?.[0]?.image?.imageBytes);
     * ```
     */async recontextImage(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=ti(this.apiClient,e);s=i("{model}:predict",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=ni(e);const n=new RecontextImageResponse;Object.assign(n,t);return n}))}throw new Error("This method is only supported by the Vertex AI.")}
/**
     * Segments an image, creating a mask of a specified area.
     *
     * @param params - The parameters for segmenting an image.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.segmentImage({
     *  model: 'image-segmentation-001',
     *  source: {
     *    image: image,
     *  },
     *  config: {
     *    mode: 'foreground',
     *  },
     * });
     * console.log(response?.generatedMasks?.[0]?.mask?.imageBytes);
     * ```
     */async segmentImage(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=ui(this.apiClient,e);s=i("{model}:predict",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=pi(e);const n=new SegmentImageResponse;Object.assign(n,t);return n}))}throw new Error("This method is only supported by the Vertex AI.")}async get(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Ls(this.apiClient,e);l=i("{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Xs(e);return t}))}{const t=ks(this.apiClient,e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=zs(e);return t}))}}async listInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Ys(this.apiClient,e);l=i("{models_url}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Ks(e);const n=new ListModelsResponse;Object.assign(n,t);return n}))}{const t=Js(this.apiClient,e);l=i("{models_url}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Ws(e);const n=new ListModelsResponse;Object.assign(n,t);return n}))}}
/**
     * Updates a tuned model by its name.
     *
     * @param params - The parameters for updating the model.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.update({
     *   model: 'tuned-model-name',
     *   config: {
     *     displayName: 'New display name',
     *     description: 'New description',
     *   },
     * });
     * ```
     */async update(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Ii(this.apiClient,e);l=i("{model}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"PATCH",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Xs(e);return t}))}{const t=_i(this.apiClient,e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"PATCH",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=zs(e);return t}))}}
/**
     * Deletes a tuned model by its name.
     *
     * @param params - The parameters for deleting the model.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.delete({model: 'tuned-model-name'});
     * ```
     */async delete(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Yo(this.apiClient,e);l=i("{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Ko(e);const n=new DeleteModelResponse;Object.assign(n,t);return n}))}{const t=Jo(this.apiClient,e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"DELETE",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Wo(e);const n=new DeleteModelResponse;Object.assign(n,t);return n}))}}
/**
     * Counts the number of tokens in the given contents. Multimodal input is
     * supported for Gemini models.
     *
     * @param params - The parameters for counting tokens.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.countTokens({
     *  model: 'gemini-2.0-flash',
     *  contents: 'The quick brown fox jumps over the lazy dog.'
     * });
     * console.log(response);
     * ```
     */async countTokens(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Vo(this.apiClient,e);l=i("{model}:countTokens",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=Bo(e);const n=new CountTokensResponse;Object.assign(n,t);return n}))}{const t=Ho(this.apiClient,e);l=i("{model}:countTokens",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=jo(e);const n=new CountTokensResponse;Object.assign(n,t);return n}))}}
/**
     * Given a list of contents, returns a corresponding TokensInfo containing
     * the list of tokens and list of token ids.
     *
     * This method is not supported by the Gemini Developer API.
     *
     * @param params - The parameters for computing tokens.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.computeTokens({
     *  model: 'gemini-2.0-flash',
     *  contents: 'What is your name?'
     * });
     * console.log(response);
     * ```
     */async computeTokens(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=Do(this.apiClient,e);s=i("{model}:computeTokens",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=Uo(e);const n=new ComputeTokensResponse;Object.assign(n,t);return n}))}throw new Error("This method is only supported by the Vertex AI.")}async generateVideosInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=As(this.apiClient,e);l=i("{model}:predictLongRunning",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Ts(e);const n=new GenerateVideosOperation;Object.assign(n,t);return n}))}{const t=Cs(this.apiClient,e);l=i("{model}:predictLongRunning",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r.then((e=>{const t=Is(e);const n=new GenerateVideosOperation;Object.assign(n,t);return n}))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Operations extends BaseModule{constructor(e){super();this.apiClient=e}
/**
     * Gets the status of a long-running operation.
     *
     * @param parameters The parameters for the get operation request.
     * @return The updated Operation object, with the latest status or result.
     */async getVideosOperation(e){const t=e.operation;const n=e.config;if(t.name===void 0||t.name==="")throw new Error("Operation name is required.");if(this.apiClient.isVertexAI()){const e=t.name.split("/operations/")[0];let o;n&&"httpOptions"in n&&(o=n.httpOptions);const s=await this.fetchPredictVideosOperationInternal({operationName:t.name,resourceName:e,config:{httpOptions:o}});return t._fromAPIResponse({apiResponse:s,_isVertexAI:true})}{const e=await this.getVideosOperationInternal({operationName:t.name,config:n});return t._fromAPIResponse({apiResponse:e,_isVertexAI:false})}}
/**
     * Gets the status of a long-running operation.
     *
     * @param parameters The parameters for the get operation request.
     * @return The updated Operation object, with the latest status or result.
     */async get(e){const t=e.operation;const n=e.config;if(t.name===void 0||t.name==="")throw new Error("Operation name is required.");if(this.apiClient.isVertexAI()){const e=t.name.split("/operations/")[0];let o;n&&"httpOptions"in n&&(o=n.httpOptions);const s=await this.fetchPredictVideosOperationInternal({operationName:t.name,resourceName:e,config:{httpOptions:o}});return t._fromAPIResponse({apiResponse:s,_isVertexAI:true})}{const e=await this.getVideosOperationInternal({operationName:t.name,config:n});return t._fromAPIResponse({apiResponse:e,_isVertexAI:false})}}async getVideosOperationInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=E(e);l=i("{operationName}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return r}{const t=y(e);l=i("{operationName}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json()));return r}}async fetchPredictVideosOperationInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=p(e);s=i("{resourceName}:fetchPredictOperation",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o}throw new Error("This method is only supported by the Vertex AI.")}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function pr(e){const t={};const n=l(e,["data"]);n!=null&&r(t,["data"],n);if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function dr(e){const t={};const n=l(e,["parts"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>_r(e))));r(t,["parts"],e)}const o=l(e,["role"]);o!=null&&r(t,["role"],o);return t}function hr(e,t,n){const o={};const s=l(t,["expireTime"]);n!==void 0&&s!=null&&r(n,["expireTime"],s);const i=l(t,["newSessionExpireTime"]);n!==void 0&&i!=null&&r(n,["newSessionExpireTime"],i);const a=l(t,["uses"]);n!==void 0&&a!=null&&r(n,["uses"],a);const c=l(t,["liveConnectConstraints"]);n!==void 0&&c!=null&&r(n,["bidiGenerateContentSetup"],Er(e,c));const u=l(t,["lockAdditionalFields"]);n!==void 0&&u!=null&&r(n,["fieldMask"],u);return o}function fr(e,t){const n={};const o=l(t,["config"]);o!=null&&r(n,["config"],hr(e,o,n));return n}function mr(e){const t={};if(l(e,["displayName"])!==void 0)throw new Error("displayName parameter is not supported in Gemini API.");const n=l(e,["fileUri"]);n!=null&&r(t,["fileUri"],n);const o=l(e,["mimeType"]);o!=null&&r(t,["mimeType"],o);return t}function gr(e){const t={};if(l(e,["authConfig"])!==void 0)throw new Error("authConfig parameter is not supported in Gemini API.");const n=l(e,["enableWidget"]);n!=null&&r(t,["enableWidget"],n);return t}function vr(e){const t={};if(l(e,["excludeDomains"])!==void 0)throw new Error("excludeDomains parameter is not supported in Gemini API.");if(l(e,["blockingConfidence"])!==void 0)throw new Error("blockingConfidence parameter is not supported in Gemini API.");const n=l(e,["timeRangeFilter"]);n!=null&&r(t,["timeRangeFilter"],n);return t}function yr(e,t){const n={};const o=l(e,["generationConfig"]);t!==void 0&&o!=null&&r(t,["setup","generationConfig"],o);const s=l(e,["responseModalities"]);t!==void 0&&s!=null&&r(t,["setup","generationConfig","responseModalities"],s);const i=l(e,["temperature"]);t!==void 0&&i!=null&&r(t,["setup","generationConfig","temperature"],i);const a=l(e,["topP"]);t!==void 0&&a!=null&&r(t,["setup","generationConfig","topP"],a);const c=l(e,["topK"]);t!==void 0&&c!=null&&r(t,["setup","generationConfig","topK"],c);const u=l(e,["maxOutputTokens"]);t!==void 0&&u!=null&&r(t,["setup","generationConfig","maxOutputTokens"],u);const p=l(e,["mediaResolution"]);t!==void 0&&p!=null&&r(t,["setup","generationConfig","mediaResolution"],p);const d=l(e,["seed"]);t!==void 0&&d!=null&&r(t,["setup","generationConfig","seed"],d);const h=l(e,["speechConfig"]);t!==void 0&&h!=null&&r(t,["setup","generationConfig","speechConfig"],nt(h));const f=l(e,["thinkingConfig"]);t!==void 0&&f!=null&&r(t,["setup","generationConfig","thinkingConfig"],f);const m=l(e,["enableAffectiveDialog"]);t!==void 0&&m!=null&&r(t,["setup","generationConfig","enableAffectiveDialog"],m);const g=l(e,["systemInstruction"]);t!==void 0&&g!=null&&r(t,["setup","systemInstruction"],dr($e(g)));const v=l(e,["tools"]);if(t!==void 0&&v!=null){let e=st(v);Array.isArray(e)&&(e=e.map((e=>Tr(ot(e)))));r(t,["setup","tools"],e)}const y=l(e,["sessionResumption"]);t!==void 0&&y!=null&&r(t,["setup","sessionResumption"],Ir(y));const E=l(e,["inputAudioTranscription"]);t!==void 0&&E!=null&&r(t,["setup","inputAudioTranscription"],E);const _=l(e,["outputAudioTranscription"]);t!==void 0&&_!=null&&r(t,["setup","outputAudioTranscription"],_);const I=l(e,["realtimeInputConfig"]);t!==void 0&&I!=null&&r(t,["setup","realtimeInputConfig"],I);const T=l(e,["contextWindowCompression"]);t!==void 0&&T!=null&&r(t,["setup","contextWindowCompression"],T);const C=l(e,["proactivity"]);t!==void 0&&C!=null&&r(t,["setup","proactivity"],C);return n}function Er(e,t){const n={};const o=l(t,["model"]);o!=null&&r(n,["setup","model"],xe(e,o));const s=l(t,["config"]);s!=null&&r(n,["config"],yr(s,n));return n}function _r(e){const t={};const n=l(e,["functionCall"]);n!=null&&r(t,["functionCall"],n);const o=l(e,["codeExecutionResult"]);o!=null&&r(t,["codeExecutionResult"],o);const s=l(e,["executableCode"]);s!=null&&r(t,["executableCode"],s);const i=l(e,["fileData"]);i!=null&&r(t,["fileData"],mr(i));const a=l(e,["functionResponse"]);a!=null&&r(t,["functionResponse"],a);const c=l(e,["inlineData"]);c!=null&&r(t,["inlineData"],pr(c));const u=l(e,["text"]);u!=null&&r(t,["text"],u);const p=l(e,["thought"]);p!=null&&r(t,["thought"],p);const d=l(e,["thoughtSignature"]);d!=null&&r(t,["thoughtSignature"],d);const h=l(e,["videoMetadata"]);h!=null&&r(t,["videoMetadata"],h);return t}function Ir(e){const t={};const n=l(e,["handle"]);n!=null&&r(t,["handle"],n);if(l(e,["transparent"])!==void 0)throw new Error("transparent parameter is not supported in Gemini API.");return t}function Tr(e){const t={};const n=l(e,["functionDeclarations"]);if(n!=null){let e=n;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["functionDeclarations"],e)}if(l(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");const o=l(e,["googleSearchRetrieval"]);o!=null&&r(t,["googleSearchRetrieval"],o);const s=l(e,["computerUse"]);s!=null&&r(t,["computerUse"],s);const i=l(e,["fileSearch"]);i!=null&&r(t,["fileSearch"],i);const a=l(e,["codeExecution"]);a!=null&&r(t,["codeExecution"],a);if(l(e,["enterpriseWebSearch"])!==void 0)throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");const c=l(e,["googleMaps"]);c!=null&&r(t,["googleMaps"],gr(c));const u=l(e,["googleSearch"]);u!=null&&r(t,["googleSearch"],vr(u));const p=l(e,["urlContext"]);p!=null&&r(t,["urlContext"],p);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Returns a comma-separated list of field masks from a given object.
 *
 * @param setup The object to extract field masks from.
 * @return A comma-separated list of field masks.
 */function Cr(e){const t=[];for(const n in e)if(Object.prototype.hasOwnProperty.call(e,n)){const o=e[n];if(typeof o==="object"&&o!=null&&Object.keys(o).length>0){const e=Object.keys(o).map((e=>`${n}.${e}`));t.push(...e)}else t.push(n)}return t.join(",")}
/**
 * Converts bidiGenerateContentSetup.
 * @param requestDict - The request dictionary.
 * @param config - The configuration object.
 * @return - The modified request dictionary.
 */function Ar(e,t){let n=null;const o=e.bidiGenerateContentSetup;if(typeof o==="object"&&o!==null&&"setup"in o){const t=o.setup;if(typeof t==="object"&&t!==null){e.bidiGenerateContentSetup=t;n=t}else delete e.bidiGenerateContentSetup}else o!==void 0&&delete e.bidiGenerateContentSetup;const s=e.fieldMask;if(n){const o=Cr(n);if(Array.isArray(t===null||t===void 0?void 0:t.lockAdditionalFields)&&(t===null||t===void 0?void 0:t.lockAdditionalFields.length)===0)o?e.fieldMask=o:delete e.fieldMask;else if((t===null||t===void 0?void 0:t.lockAdditionalFields)&&t.lockAdditionalFields.length>0&&s!==null&&Array.isArray(s)&&s.length>0){const t=["temperature","topK","topP","maxOutputTokens","responseModalities","seed","speechConfig"];let n=[];s.length>0&&(n=s.map((e=>t.includes(e)?`generationConfig.${e}`:e)));const i=[];o&&i.push(o);n.length>0&&i.push(...n);i.length>0?e.fieldMask=i.join(","):delete e.fieldMask}else delete e.fieldMask}else s!==null&&Array.isArray(s)&&s.length>0?e.fieldMask=s.join(","):delete e.fieldMask;return e}class Tokens extends BaseModule{constructor(e){super();this.apiClient=e}
/**
     * Creates an ephemeral auth token resource.
     *
     * @experimental
     *
     * @remarks
     * Ephemeral auth tokens is only supported in the Gemini Developer API.
     * It can be used for the session connection to the Live constrained API.
     * Support in v1alpha only.
     *
     * @param params - The parameters for the create request.
     * @return The created auth token.
     *
     * @example
     * ```ts
     * const ai = new GoogleGenAI({
     *     apiKey: token.name,
     *     httpOptions: { apiVersion: 'v1alpha' }  // Support in v1alpha only.
     * });
     *
     * // Case 1: If LiveEphemeralParameters is unset, unlock LiveConnectConfig
     * // when using the token in Live API sessions. Each session connection can
     * // use a different configuration.
     * const config: CreateAuthTokenConfig = {
     *     uses: 3,
     *     expireTime: '2025-05-01T00:00:00Z',
     * }
     * const token = await ai.tokens.create(config);
     *
     * // Case 2: If LiveEphemeralParameters is set, lock all fields in
     * // LiveConnectConfig when using the token in Live API sessions. For
     * // example, changing `outputAudioTranscription` in the Live API
     * // connection will be ignored by the API.
     * const config: CreateAuthTokenConfig =
     *     uses: 3,
     *     expireTime: '2025-05-01T00:00:00Z',
     *     LiveEphemeralParameters: {
     *        model: 'gemini-2.0-flash-001',
     *        config: {
     *           'responseModalities': ['AUDIO'],
     *           'systemInstruction': 'Always answer in English.',
     *        }
     *     }
     * }
     * const token = await ai.tokens.create(config);
     *
     * // Case 3: If LiveEphemeralParameters is set and lockAdditionalFields is
     * // set, lock LiveConnectConfig with set and additional fields (e.g.
     * // responseModalities, systemInstruction, temperature in this example) when
     * // using the token in Live API sessions.
     * const config: CreateAuthTokenConfig =
     *     uses: 3,
     *     expireTime: '2025-05-01T00:00:00Z',
     *     LiveEphemeralParameters: {
     *        model: 'gemini-2.0-flash-001',
     *        config: {
     *           'responseModalities': ['AUDIO'],
     *           'systemInstruction': 'Always answer in English.',
     *        }
     *     },
     *     lockAdditionalFields: ['temperature'],
     * }
     * const token = await ai.tokens.create(config);
     *
     * // Case 4: If LiveEphemeralParameters is set and lockAdditionalFields is
     * // empty array, lock LiveConnectConfig with set fields (e.g.
     * // responseModalities, systemInstruction in this example) when using the
     * // token in Live API sessions.
     * const config: CreateAuthTokenConfig =
     *     uses: 3,
     *     expireTime: '2025-05-01T00:00:00Z',
     *     LiveEphemeralParameters: {
     *        model: 'gemini-2.0-flash-001',
     *        config: {
     *           'responseModalities': ['AUDIO'],
     *           'systemInstruction': 'Always answer in English.',
     *        }
     *     },
     *     lockAdditionalFields: [],
     * }
     * const token = await ai.tokens.create(config);
     * ```
     */async create(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");{const l=fr(this.apiClient,e);s=i("auth_tokens",l._url);r=l._query;delete l.config;delete l._url;delete l._query;const a=Ar(l,e.config);o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>e))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Sr(e,t){const n={};const o=l(e,["displayName"]);t!==void 0&&o!=null&&r(t,["displayName"],o);return n}function Or(e){const t={};const n=l(e,["config"]);n!=null&&Sr(n,t);return t}function Rr(e,t){const n={};const o=l(e,["force"]);t!==void 0&&o!=null&&r(t,["_query","force"],o);return n}function br(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["_url","name"],n);const o=l(e,["config"]);o!=null&&Rr(o,t);return t}function Nr(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["_url","name"],n);return t}function Pr(e,t){const n={};const o=l(e,["customMetadata"]);if(t!==void 0&&o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["customMetadata"],e)}const s=l(e,["chunkingConfig"]);t!==void 0&&s!=null&&r(t,["chunkingConfig"],s);return n}function wr(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["name"],n);const o=l(e,["metadata"]);o!=null&&r(t,["metadata"],o);const s=l(e,["done"]);s!=null&&r(t,["done"],s);const i=l(e,["error"]);i!=null&&r(t,["error"],i);const a=l(e,["response"]);a!=null&&r(t,["response"],Dr(a));return t}function Mr(e){const t={};const n=l(e,["fileSearchStoreName"]);n!=null&&r(t,["_url","file_search_store_name"],n);const o=l(e,["fileName"]);o!=null&&r(t,["fileName"],o);const s=l(e,["config"]);s!=null&&Pr(s,t);return t}function Dr(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["parent"]);o!=null&&r(t,["parent"],o);const s=l(e,["documentName"]);s!=null&&r(t,["documentName"],s);return t}function Ur(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);return n}function kr(e){const t={};const n=l(e,["config"]);n!=null&&Ur(n,t);return t}function Lr(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["fileSearchStores"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["fileSearchStores"],e)}return t}function qr(e,t){const n={};const o=l(e,["mimeType"]);t!==void 0&&o!=null&&r(t,["mimeType"],o);const s=l(e,["displayName"]);t!==void 0&&s!=null&&r(t,["displayName"],s);const i=l(e,["customMetadata"]);if(t!==void 0&&i!=null){let e=i;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["customMetadata"],e)}const a=l(e,["chunkingConfig"]);t!==void 0&&a!=null&&r(t,["chunkingConfig"],a);return n}function xr(e){const t={};const n=l(e,["fileSearchStoreName"]);n!=null&&r(t,["_url","file_search_store_name"],n);const o=l(e,["config"]);o!=null&&qr(o,t);return t}function Gr(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Fr(e,t){const n={};const o=l(e,["force"]);t!==void 0&&o!=null&&r(t,["_query","force"],o);return n}function Hr(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["_url","name"],n);const o=l(e,["config"]);o!=null&&Fr(o,t);return t}function Vr(e){const t={};const n=l(e,["name"]);n!=null&&r(t,["_url","name"],n);return t}function jr(e,t){const n={};const o=l(e,["pageSize"]);t!==void 0&&o!=null&&r(t,["_query","pageSize"],o);const s=l(e,["pageToken"]);t!==void 0&&s!=null&&r(t,["_query","pageToken"],s);return n}function Br(e){const t={};const n=l(e,["parent"]);n!=null&&r(t,["_url","parent"],n);const o=l(e,["config"]);o!=null&&jr(o,t);return t}function Jr(e){const t={};const n=l(e,["sdkHttpResponse"]);n!=null&&r(t,["sdkHttpResponse"],n);const o=l(e,["nextPageToken"]);o!=null&&r(t,["nextPageToken"],o);const s=l(e,["documents"]);if(s!=null){let e=s;Array.isArray(e)&&(e=e.map((e=>e)));r(t,["documents"],e)}return t}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Documents extends BaseModule{constructor(e){super();this.apiClient=e;
/**
         * Lists documents.
         *
         * @param params - The parameters for the list request.
         * @return - A pager of documents.
         *
         * @example
         * ```ts
         * const documents = await ai.documents.list({config: {'pageSize': 2}});
         * for await (const document of documents) {
         *   console.log(document);
         * }
         * ```
         */this.list=async e=>new Pager(mn.PAGED_ITEM_DOCUMENTS,(t=>this.listInternal({parent:e.parent,config:t.config})),await this.listInternal(e),e)}
/**
     * Gets a Document.
     *
     * @param params - The parameters for getting a document.
     * @return Document.
     */async get(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Vr(e);s=i("{name}",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>e))}}
/**
     * Deletes a Document.
     *
     * @param params - The parameters for deleting a document.
     */async delete(e){var t,n;let o="";let s={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const r=Hr(e);o=i("{name}",r._url);s=r._query;delete r._url;delete r._query;await this.apiClient.request({path:o,queryParams:s,body:JSON.stringify(r),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal})}}
/**
     * Lists all Documents in a FileSearchStore.
     *
     * @param params - The parameters for listing documents.
     * @return ListDocumentsResponse.
     */async listInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Br(e);s=i("{parent}/documents",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=Jr(e);const n=new ListDocumentsResponse;Object.assign(n,t);return n}))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class FileSearchStores extends BaseModule{constructor(e,t=new Documents(e)){super();this.apiClient=e;this.documents=t;
/**
         * Lists file search stores.
         *
         * @param params - The parameters for the list request.
         * @return - A pager of file search stores.
         *
         * @example
         * ```ts
         * const fileSearchStores = await ai.fileSearchStores.list({config: {'pageSize': 2}});
         * for await (const fileSearchStore of fileSearchStores) {
         *   console.log(fileSearchStore);
         * }
         * ```
         */this.list=async(e={})=>new Pager(mn.PAGED_ITEM_FILE_SEARCH_STORES,(e=>this.listInternal(e)),await this.listInternal(e),e)}
/**
     * Uploads a file asynchronously to a given File Search Store.
     * This method is not available in Vertex AI.
     * Supported upload sources:
     * - Node.js: File path (string) or Blob object.
     * - Browser: Blob object (e.g., File).
     *
     * @remarks
     * The `mimeType` can be specified in the `config` parameter. If omitted:
     *  - For file path (string) inputs, the `mimeType` will be inferred from the
     *     file extension.
     *  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
     *     property.
     *
     * This section can contain multiple paragraphs and code examples.
     *
     * @param params - Optional parameters specified in the
     *        `types.UploadToFileSearchStoreParameters` interface.
     *         @see {@link types.UploadToFileSearchStoreParameters#config} for the optional
     *         config in the parameters.
     * @return A promise that resolves to a long running operation.
     * @throws An error if called on a Vertex AI client.
     * @throws An error if the `mimeType` is not provided and can not be inferred,
     * the `mimeType` can be provided in the `params.config` parameter.
     * @throws An error occurs if a suitable upload location cannot be established.
     *
     * @example
     * The following code uploads a file to a given file search store.
     *
     * ```ts
     * const operation = await ai.fileSearchStores.upload({fileSearchStoreName: 'fileSearchStores/foo-bar', file: 'file.txt', config: {
     *   mimeType: 'text/plain',
     * }});
     * console.log(operation.name);
     * ```
     */async uploadToFileSearchStore(e){if(this.apiClient.isVertexAI())throw new Error("Vertex AI does not support uploading files to a file search store.");return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName,e.file,e.config)}
/**
     * Creates a File Search Store.
     *
     * @param params - The parameters for creating a File Search Store.
     * @return FileSearchStore.
     */async create(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Or(e);s=i("fileSearchStores",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>e))}}
/**
     * Gets a File Search Store.
     *
     * @param params - The parameters for getting a File Search Store.
     * @return FileSearchStore.
     */async get(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Nr(e);s=i("{name}",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>e))}}
/**
     * Deletes a File Search Store.
     *
     * @param params - The parameters for deleting a File Search Store.
     */async delete(e){var t,n;let o="";let s={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const r=br(e);o=i("{name}",r._url);s=r._query;delete r._url;delete r._query;await this.apiClient.request({path:o,queryParams:s,body:JSON.stringify(r),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal})}}
/**
     * Lists all FileSearchStore owned by the user.
     *
     * @param params - The parameters for listing file search stores.
     * @return ListFileSearchStoresResponse.
     */async listInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=kr(e);s=i("fileSearchStores",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=Lr(e);const n=new ListFileSearchStoresResponse;Object.assign(n,t);return n}))}}async uploadToFileSearchStoreInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=xr(e);s=i("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=Gr(e);const n=new UploadToFileSearchStoreResumableResponse;Object.assign(n,t);return n}))}}
/**
     * Imports a File from File Service to a FileSearchStore.
     *
     * This is a long-running operation, see aip.dev/151
     *
     * @param params - The parameters for importing a file to a file search store.
     * @return ImportFileOperation.
     */async importFile(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=Mr(e);s=i("{file_search_store_name}:importFile",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json()));return o.then((e=>{const t=wr(e);const n=new ImportFileOperation;Object.assign(n,t);return n}))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Yr(e,t){const n={};const o=l(e,["name"]);o!=null&&r(n,["_url","name"],o);return n}function Wr(e,t){const n={};const o=l(e,["name"]);o!=null&&r(n,["_url","name"],o);return n}function Kr(e,t,n){const o={};if(l(e,["validationDataset"])!==void 0)throw new Error("validationDataset parameter is not supported in Gemini API.");const s=l(e,["tunedModelDisplayName"]);t!==void 0&&s!=null&&r(t,["displayName"],s);if(l(e,["description"])!==void 0)throw new Error("description parameter is not supported in Gemini API.");const i=l(e,["epochCount"]);t!==void 0&&i!=null&&r(t,["tuningTask","hyperparameters","epochCount"],i);const a=l(e,["learningRateMultiplier"]);a!=null&&r(o,["tuningTask","hyperparameters","learningRateMultiplier"],a);if(l(e,["exportLastCheckpointOnly"])!==void 0)throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");if(l(e,["preTunedModelCheckpointId"])!==void 0)throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");if(l(e,["adapterSize"])!==void 0)throw new Error("adapterSize parameter is not supported in Gemini API.");const c=l(e,["batchSize"]);t!==void 0&&c!=null&&r(t,["tuningTask","hyperparameters","batchSize"],c);const u=l(e,["learningRate"]);t!==void 0&&u!=null&&r(t,["tuningTask","hyperparameters","learningRate"],u);if(l(e,["labels"])!==void 0)throw new Error("labels parameter is not supported in Gemini API.");if(l(e,["beta"])!==void 0)throw new Error("beta parameter is not supported in Gemini API.");return o}function $r(e,t,n){const o={};let s=l(n,["config","method"]);s===void 0&&(s="SUPERVISED_FINE_TUNING");if(s==="SUPERVISED_FINE_TUNING"){const n=l(e,["validationDataset"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec"],dl(n))}else if(s==="PREFERENCE_TUNING"){const n=l(e,["validationDataset"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec"],dl(n))}const i=l(e,["tunedModelDisplayName"]);t!==void 0&&i!=null&&r(t,["tunedModelDisplayName"],i);const a=l(e,["description"]);t!==void 0&&a!=null&&r(t,["description"],a);let c=l(n,["config","method"]);c===void 0&&(c="SUPERVISED_FINE_TUNING");if(c==="SUPERVISED_FINE_TUNING"){const n=l(e,["epochCount"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec","hyperParameters","epochCount"],n)}else if(c==="PREFERENCE_TUNING"){const n=l(e,["epochCount"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec","hyperParameters","epochCount"],n)}let u=l(n,["config","method"]);u===void 0&&(u="SUPERVISED_FINE_TUNING");if(u==="SUPERVISED_FINE_TUNING"){const n=l(e,["learningRateMultiplier"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec","hyperParameters","learningRateMultiplier"],n)}else if(u==="PREFERENCE_TUNING"){const n=l(e,["learningRateMultiplier"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec","hyperParameters","learningRateMultiplier"],n)}let p=l(n,["config","method"]);p===void 0&&(p="SUPERVISED_FINE_TUNING");if(p==="SUPERVISED_FINE_TUNING"){const n=l(e,["exportLastCheckpointOnly"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec","exportLastCheckpointOnly"],n)}else if(p==="PREFERENCE_TUNING"){const n=l(e,["exportLastCheckpointOnly"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec","exportLastCheckpointOnly"],n)}let d=l(n,["config","method"]);d===void 0&&(d="SUPERVISED_FINE_TUNING");if(d==="SUPERVISED_FINE_TUNING"){const n=l(e,["adapterSize"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec","hyperParameters","adapterSize"],n)}else if(d==="PREFERENCE_TUNING"){const n=l(e,["adapterSize"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec","hyperParameters","adapterSize"],n)}if(l(e,["batchSize"])!==void 0)throw new Error("batchSize parameter is not supported in Vertex AI.");if(l(e,["learningRate"])!==void 0)throw new Error("learningRate parameter is not supported in Vertex AI.");const h=l(e,["labels"]);t!==void 0&&h!=null&&r(t,["labels"],h);const f=l(e,["beta"]);t!==void 0&&f!=null&&r(t,["preferenceOptimizationSpec","hyperParameters","beta"],f);return o}function zr(e,t){const n={};const o=l(e,["baseModel"]);o!=null&&r(n,["baseModel"],o);const s=l(e,["preTunedModel"]);s!=null&&r(n,["preTunedModel"],s);const i=l(e,["trainingDataset"]);i!=null&&ll(i);const a=l(e,["config"]);a!=null&&Kr(a,n);return n}function Xr(e,t){const n={};const o=l(e,["baseModel"]);o!=null&&r(n,["baseModel"],o);const s=l(e,["preTunedModel"]);s!=null&&r(n,["preTunedModel"],s);const i=l(e,["trainingDataset"]);i!=null&&al(i,n,t);const a=l(e,["config"]);a!=null&&$r(a,n,t);return n}function Qr(e,t){const n={};const o=l(e,["name"]);o!=null&&r(n,["_url","name"],o);return n}function Zr(e,t){const n={};const o=l(e,["name"]);o!=null&&r(n,["_url","name"],o);return n}function el(e,t,n){const o={};const s=l(e,["pageSize"]);t!==void 0&&s!=null&&r(t,["_query","pageSize"],s);const i=l(e,["pageToken"]);t!==void 0&&i!=null&&r(t,["_query","pageToken"],i);const a=l(e,["filter"]);t!==void 0&&a!=null&&r(t,["_query","filter"],a);return o}function tl(e,t,n){const o={};const s=l(e,["pageSize"]);t!==void 0&&s!=null&&r(t,["_query","pageSize"],s);const i=l(e,["pageToken"]);t!==void 0&&i!=null&&r(t,["_query","pageToken"],i);const a=l(e,["filter"]);t!==void 0&&a!=null&&r(t,["_query","filter"],a);return o}function nl(e,t){const n={};const o=l(e,["config"]);o!=null&&el(o,n);return n}function ol(e,t){const n={};const o=l(e,["config"]);o!=null&&tl(o,n);return n}function sl(e,t){const n={};const o=l(e,["sdkHttpResponse"]);o!=null&&r(n,["sdkHttpResponse"],o);const s=l(e,["nextPageToken"]);s!=null&&r(n,["nextPageToken"],s);const i=l(e,["tunedModels"]);if(i!=null){let e=i;Array.isArray(e)&&(e=e.map((e=>cl(e))));r(n,["tuningJobs"],e)}return n}function il(e,t){const n={};const o=l(e,["sdkHttpResponse"]);o!=null&&r(n,["sdkHttpResponse"],o);const s=l(e,["nextPageToken"]);s!=null&&r(n,["nextPageToken"],s);const i=l(e,["tuningJobs"]);if(i!=null){let e=i;Array.isArray(e)&&(e=e.map((e=>ul(e))));r(n,["tuningJobs"],e)}return n}function rl(e,t){const n={};const o=l(e,["name"]);o!=null&&r(n,["model"],o);const s=l(e,["name"]);s!=null&&r(n,["endpoint"],s);return n}function ll(e,t){const n={};if(l(e,["gcsUri"])!==void 0)throw new Error("gcsUri parameter is not supported in Gemini API.");if(l(e,["vertexDatasetResource"])!==void 0)throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");const o=l(e,["examples"]);if(o!=null){let e=o;Array.isArray(e)&&(e=e.map((e=>e)));r(n,["examples","examples"],e)}return n}function al(e,t,n){const o={};let s=l(n,["config","method"]);s===void 0&&(s="SUPERVISED_FINE_TUNING");if(s==="SUPERVISED_FINE_TUNING"){const n=l(e,["gcsUri"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec","trainingDatasetUri"],n)}else if(s==="PREFERENCE_TUNING"){const n=l(e,["gcsUri"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec","trainingDatasetUri"],n)}let i=l(n,["config","method"]);i===void 0&&(i="SUPERVISED_FINE_TUNING");if(i==="SUPERVISED_FINE_TUNING"){const n=l(e,["vertexDatasetResource"]);t!==void 0&&n!=null&&r(t,["supervisedTuningSpec","trainingDatasetUri"],n)}else if(i==="PREFERENCE_TUNING"){const n=l(e,["vertexDatasetResource"]);t!==void 0&&n!=null&&r(t,["preferenceOptimizationSpec","trainingDatasetUri"],n)}if(l(e,["examples"])!==void 0)throw new Error("examples parameter is not supported in Vertex AI.");return o}function cl(e,t){const n={};const o=l(e,["sdkHttpResponse"]);o!=null&&r(n,["sdkHttpResponse"],o);const s=l(e,["name"]);s!=null&&r(n,["name"],s);const i=l(e,["state"]);i!=null&&r(n,["state"],lt(i));const a=l(e,["createTime"]);a!=null&&r(n,["createTime"],a);const c=l(e,["tuningTask","startTime"]);c!=null&&r(n,["startTime"],c);const u=l(e,["tuningTask","completeTime"]);u!=null&&r(n,["endTime"],u);const p=l(e,["updateTime"]);p!=null&&r(n,["updateTime"],p);const d=l(e,["description"]);d!=null&&r(n,["description"],d);const h=l(e,["baseModel"]);h!=null&&r(n,["baseModel"],h);const f=l(e,["_self"]);f!=null&&r(n,["tunedModel"],rl(f));return n}function ul(e,t){const n={};const o=l(e,["sdkHttpResponse"]);o!=null&&r(n,["sdkHttpResponse"],o);const s=l(e,["name"]);s!=null&&r(n,["name"],s);const i=l(e,["state"]);i!=null&&r(n,["state"],lt(i));const a=l(e,["createTime"]);a!=null&&r(n,["createTime"],a);const c=l(e,["startTime"]);c!=null&&r(n,["startTime"],c);const u=l(e,["endTime"]);u!=null&&r(n,["endTime"],u);const p=l(e,["updateTime"]);p!=null&&r(n,["updateTime"],p);const d=l(e,["error"]);d!=null&&r(n,["error"],d);const h=l(e,["description"]);h!=null&&r(n,["description"],h);const f=l(e,["baseModel"]);f!=null&&r(n,["baseModel"],f);const m=l(e,["tunedModel"]);m!=null&&r(n,["tunedModel"],m);const g=l(e,["preTunedModel"]);g!=null&&r(n,["preTunedModel"],g);const v=l(e,["supervisedTuningSpec"]);v!=null&&r(n,["supervisedTuningSpec"],v);const y=l(e,["preferenceOptimizationSpec"]);y!=null&&r(n,["preferenceOptimizationSpec"],y);const E=l(e,["tuningDataStats"]);E!=null&&r(n,["tuningDataStats"],E);const _=l(e,["encryptionSpec"]);_!=null&&r(n,["encryptionSpec"],_);const I=l(e,["partnerModelTuningSpec"]);I!=null&&r(n,["partnerModelTuningSpec"],I);const T=l(e,["customBaseModel"]);T!=null&&r(n,["customBaseModel"],T);const C=l(e,["experiment"]);C!=null&&r(n,["experiment"],C);const A=l(e,["labels"]);A!=null&&r(n,["labels"],A);const S=l(e,["outputUri"]);S!=null&&r(n,["outputUri"],S);const O=l(e,["pipelineJob"]);O!=null&&r(n,["pipelineJob"],O);const R=l(e,["serviceAccount"]);R!=null&&r(n,["serviceAccount"],R);const b=l(e,["tunedModelDisplayName"]);b!=null&&r(n,["tunedModelDisplayName"],b);const N=l(e,["veoTuningSpec"]);N!=null&&r(n,["veoTuningSpec"],N);return n}function pl(e,t){const n={};const o=l(e,["sdkHttpResponse"]);o!=null&&r(n,["sdkHttpResponse"],o);const s=l(e,["name"]);s!=null&&r(n,["name"],s);const i=l(e,["metadata"]);i!=null&&r(n,["metadata"],i);const a=l(e,["done"]);a!=null&&r(n,["done"],a);const c=l(e,["error"]);c!=null&&r(n,["error"],c);return n}function dl(e,t){const n={};const o=l(e,["gcsUri"]);o!=null&&r(n,["validationDatasetUri"],o);const s=l(e,["vertexDatasetResource"]);s!=null&&r(n,["validationDatasetUri"],s);return n}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Tunings extends BaseModule{constructor(e){super();this.apiClient=e;
/**
         * Gets a TuningJob.
         *
         * @param name - The resource name of the tuning job.
         * @return - A TuningJob object.
         *
         * @experimental - The SDK's tuning implementation is experimental, and may
         * change in future versions.
         */this.get=async e=>await this.getInternal(e);
/**
         * Lists tuning jobs.
         *
         * @param config - The configuration for the list request.
         * @return - A list of tuning jobs.
         *
         * @experimental - The SDK's tuning implementation is experimental, and may
         * change in future versions.
         */this.list=async(e={})=>new Pager(mn.PAGED_ITEM_TUNING_JOBS,(e=>this.listInternal(e)),await this.listInternal(e),e);
/**
         * Creates a supervised fine-tuning job.
         *
         * @param params - The parameters for the tuning job.
         * @return - A TuningJob operation.
         *
         * @experimental - The SDK's tuning implementation is experimental, and may
         * change in future versions.
         */this.tune=async e=>{var t;if(this.apiClient.isVertexAI()){if(e.baseModel.startsWith("projects/")){const n={tunedModelName:e.baseModel};((t=e.config)===null||t===void 0?void 0:t.preTunedModelCheckpointId)&&(n.checkpointId=e.config.preTunedModelCheckpointId);const o=Object.assign(Object.assign({},e),{preTunedModel:n});o.baseModel=void 0;return await this.tuneInternal(o)}{const t=Object.assign({},e);return await this.tuneInternal(t)}}{const t=Object.assign({},e);const n=await this.tuneMldevInternal(t);let o="";n.metadata!==void 0&&n.metadata.tunedModel!==void 0?o=n.metadata.tunedModel:n.name!==void 0&&n.name.includes("/operations/")&&(o=n.name.split("/operations/")[0]);const s={name:o,state:K.JOB_STATE_QUEUED};return s}}}async getInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=Zr(e);l=i("{name}",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=ul(e);return t}))}{const t=Qr(e);l=i("{name}",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=cl(e);return t}))}}async listInternal(e){var t,n,o,s;let r;let l="";let a={};if(this.apiClient.isVertexAI()){const o=ol(e);l=i("tuningJobs",o._url);a=o._query;delete o._url;delete o._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=il(e);const n=new ListTuningJobsResponse;Object.assign(n,t);return n}))}{const t=nl(e);l=i("tunedModels",t._url);a=t._query;delete t._url;delete t._query;r=this.apiClient.request({path:l,queryParams:a,body:JSON.stringify(t),httpMethod:"GET",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return r.then((e=>{const t=sl(e);const n=new ListTuningJobsResponse;Object.assign(n,t);return n}))}}
/**
     * Cancels a tuning job.
     *
     * @param params - The parameters for the cancel request.
     * @return The empty response returned by the API.
     *
     * @example
     * ```ts
     * await ai.tunings.cancel({name: '...'}); // The server-generated resource name.
     * ```
     */async cancel(e){var t,n,o,s;let r="";let l={};if(this.apiClient.isVertexAI()){const o=Wr(e);r=i("{name}:cancel",o._url);l=o._query;delete o._url;delete o._query;await this.apiClient.request({path:r,queryParams:l,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal})}else{const t=Yr(e);r=i("{name}:cancel",t._url);l=t._query;delete t._url;delete t._query;await this.apiClient.request({path:r,queryParams:l,body:JSON.stringify(t),httpMethod:"POST",httpOptions:(o=e.config)===null||o===void 0?void 0:o.httpOptions,abortSignal:(s=e.config)===null||s===void 0?void 0:s.abortSignal})}}async tuneInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI()){const l=Xr(e,e);s=i("tuningJobs",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=ul(e);return t}))}throw new Error("This method is only supported by the Vertex AI.")}async tuneMldevInternal(e){var t,n;let o;let s="";let r={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const l=zr(e);s=i("tunedModels",l._url);r=l._query;delete l._url;delete l._query;o=this.apiClient.request({path:s,queryParams:r,body:JSON.stringify(l),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions,abortSignal:(n=e.config)===null||n===void 0?void 0:n.abortSignal}).then((e=>e.json().then((t=>{const n=t;n.sdkHttpResponse={headers:e.headers};return n}))));return o.then((e=>{const t=pl(e);return t}))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class BrowserDownloader{async download(e,t){throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.")}}const hl=8388608;const fl=3;const ml=1e3;const gl=2;const vl="x-goog-upload-status";async function yl(e,t,n){var o;const s=await _l(e,t,n);const i=await(s===null||s===void 0?void 0:s.json());if(((o=s===null||s===void 0?void 0:s.headers)===null||o===void 0?void 0:o[vl])!=="final")throw new Error("Failed to upload file: Upload status is not finalized.");return i.file}async function El(e,t,n){var o;const s=await _l(e,t,n);const i=await(s===null||s===void 0?void 0:s.json());if(((o=s===null||s===void 0?void 0:s.headers)===null||o===void 0?void 0:o[vl])!=="final")throw new Error("Failed to upload file: Upload status is not finalized.");const r=T(i);const l=new UploadToFileSearchStoreOperation;Object.assign(l,r);return l}async function _l(e,t,n){var o,s;let i=0;let r=0;let l=new HttpResponse(new Response);let a="upload";i=e.size;while(r<i){const c=Math.min(hl,i-r);const u=e.slice(r,r+c);r+c>=i&&(a+=", finalize");let p=0;let d=ml;while(p<fl){l=await n.request({path:"",body:u,httpMethod:"POST",httpOptions:{apiVersion:"",baseUrl:t,headers:{"X-Goog-Upload-Command":a,"X-Goog-Upload-Offset":String(r),"Content-Length":String(c)}}});if((o=l===null||l===void 0?void 0:l.headers)===null||o===void 0?void 0:o[vl])break;p++;await Tl(d);d*=gl}r+=c;if(((s=l===null||l===void 0?void 0:l.headers)===null||s===void 0?void 0:s[vl])!=="active")break;if(i<=r)throw new Error("All content has been uploaded, but the upload status is not finalized.")}return l}async function Il(e){const t={size:e.size,type:e.type};return t}function Tl(e){return new Promise((t=>setTimeout(t,e)))}class BrowserUploader{async upload(e,t,n){if(typeof e==="string")throw new Error("File path is not supported in browser uploader.");return await yl(e,t,n)}async uploadToFileSearchStore(e,t,n){if(typeof e==="string")throw new Error("File path is not supported in browser uploader.");return await El(e,t,n)}async stat(e){if(typeof e==="string")throw new Error("File path is not supported in browser uploader.");return await Il(e)}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class BrowserWebSocketFactory{create(e,t,n){return new BrowserWebSocket(e,t,n)}}class BrowserWebSocket{constructor(e,t,n){this.url=e;this.headers=t;this.callbacks=n}connect(){this.ws=new WebSocket(this.url);this.ws.onopen=this.callbacks.onopen;this.ws.onerror=this.callbacks.onerror;this.ws.onclose=this.callbacks.onclose;this.ws.onmessage=this.callbacks.onmessage}send(e){if(this.ws===void 0)throw new Error("WebSocket is not connected");this.ws.send(e)}close(){if(this.ws===void 0)throw new Error("WebSocket is not connected");this.ws.close()}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Cl="x-goog-api-key";class WebAuth{constructor(e){this.apiKey=e}async addAuthHeaders(e,t){if(e.get(Cl)===null){if(this.apiKey.startsWith("auth_tokens/"))throw new Error("Ephemeral tokens are only supported by the live API.");if(!this.apiKey)throw new Error("API key is missing. Please provide a valid API key.");e.append(Cl,this.apiKey)}}}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Al="gl-node/";class GoogleGenAI{constructor(e){var t;if(e.apiKey==null)throw new Error("An API Key must be set when running in a browser");if(e.project||e.location)throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");this.vertexai=(t=e.vertexai)!==null&&t!==void 0&&t;this.apiKey=e.apiKey;const n=s(e.httpOptions,e.vertexai,void 0,void 0);n&&(e.httpOptions?e.httpOptions.baseUrl=n:e.httpOptions={baseUrl:n});this.apiVersion=e.apiVersion;const o=new WebAuth(this.apiKey);this.apiClient=new ApiClient({auth:o,apiVersion:this.apiVersion,apiKey:this.apiKey,vertexai:this.vertexai,httpOptions:e.httpOptions,userAgentExtra:Al+"web",uploader:new BrowserUploader,downloader:new BrowserDownloader});this.models=new Models(this.apiClient);this.live=new Live(this.apiClient,o,new BrowserWebSocketFactory);this.batches=new Batches(this.apiClient);this.chats=new Chats(this.models,this.apiClient);this.caches=new Caches(this.apiClient);this.files=new Files(this.apiClient);this.operations=new Operations(this.apiClient);this.authTokens=new Tokens(this.apiClient);this.tunings=new Tunings(this.apiClient);this.fileSearchStores=new FileSearchStores(this.apiClient)}}export{_e as ActivityHandling,W as AdapterSize,ApiError,w as ApiSpec,M as AuthType,Batches,X as Behavior,V as BlockedReason,Caches,Chat,Chats,ComputeTokensResponse,ContentReferenceImage,ControlReferenceImage,ie as ControlReferenceType,CountTokensResponse,CreateFileResponse,DeleteCachedContentResponse,DeleteFileResponse,DeleteModelResponse,he as DocumentState,Q as DynamicRetrievalConfigMode,EditImageResponse,le as EditMode,EmbedContentResponse,Ee as EndSensitivity,Z as Environment,z as FeatureSelectionPreference,me as FileSource,fe as FileState,Files,x as FinishReason,ee as FunctionCallingConfigMode,FunctionResponse,FunctionResponseBlob,FunctionResponseFileData,FunctionResponsePart,b as FunctionResponseScheduling,GenerateContentResponse,GenerateContentResponsePromptFeedback,GenerateContentResponseUsageMetadata,GenerateImagesResponse,GenerateVideosOperation,GenerateVideosResponse,GoogleGenAI,L as HarmBlockMethod,q as HarmBlockThreshold,k as HarmCategory,G as HarmProbability,F as HarmSeverity,D as HttpElementLocation,HttpResponse,oe as ImagePromptLanguage,ImportFileOperation,ImportFileResponse,InlinedEmbedContentResponse,InlinedResponse,K as JobState,R as Language,ListBatchJobsResponse,ListCachedContentsResponse,ListDocumentsResponse,ListFileSearchStoresResponse,ListFilesResponse,ListModelsResponse,ListTuningJobsResponse,Live,LiveClientToolResponse,Ae as LiveMusicPlaybackControl,LiveMusicServerMessage,LiveSendToolResponseParameters,LiveServerMessage,MaskReferenceImage,se as MaskReferenceMode,ve as MediaModality,J as MediaResolution,B as Modality,P as Mode,Models,Ce as MusicGenerationMode,Operations,O as Outcome,mn as PagedItem,Pager,ne as PersonGeneration,U as PhishBlockThreshold,RawReferenceImage,RecontextImageResponse,ReplayResponse,te as SafetyFilterLevel,Te as Scale,SegmentImageResponse,ae as SegmentMode,Session,SingleEmbedContentResponse,ye as StartSensitivity,StyleReferenceImage,SubjectReferenceImage,re as SubjectReferenceType,Tokens,j as TrafficType,de as TuningMethod,Y as TuningMode,$ as TuningTask,ge as TurnCompleteReason,Ie as TurnCoverage,N as Type,UploadToFileSearchStoreOperation,UploadToFileSearchStoreResponse,UploadToFileSearchStoreResumableResponse,UpscaleImageResponse,H as UrlRetrievalStatus,pe as VideoCompressionQuality,ue as VideoGenerationMaskMode,ce as VideoGenerationReferenceType,Se as createFunctionResponsePartFromBase64,Oe as createFunctionResponsePartFromUri,qe as createModelContent,we as createPartFromBase64,Me as createPartFromCodeExecutionResult,De as createPartFromExecutableCode,Ne as createPartFromFunctionCall,Pe as createPartFromFunctionResponse,be as createPartFromText,Re as createPartFromUri,Le as createUserContent,zi as mcpToTool,n as setDefaultBaseUrls};

