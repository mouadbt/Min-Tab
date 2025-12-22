import {icons} from "./icons.json"
document.addEventListener('click', () => {
    // ------------ get page elements
    const DOMelements=[
        {
            selectorName:"search-btn",
            selectorType:"#",
            selectorEl:"searchBtn",
            value:"searchIcon"
        },
        {
            selectorName:"settingsIcon",
            selectorType:"#",
            selectorEl:"settingsBtn"
        }
    ]
    // ------------ load page elements
    // load icons
    DOMelements.map((el)=>{
        document.querySelector(`${el.selectorType}${el.selectorName}`).innerHTML=el.value;
    });

})