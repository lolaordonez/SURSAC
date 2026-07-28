/* @license GPL-2.0-or-later https://www.drupal.org/licensing/faq */
window.sonoco=window.sonoco||{regions:["anz","emea","latam","na"],listen:function(name,func){document.querySelector("head").addEventListener("sonoco."+name,func);},trigger:function(name,payload){const event=new CustomEvent("sonoco."+name,{detail:payload});document.querySelector("head").dispatchEvent(event);}};;
