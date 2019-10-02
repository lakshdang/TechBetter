let observer;

document.addEventListener('DOMContentLoaded', init);

function init(){
    let p = document.querySelector('body'); //1st p
    
    let config = {
        attributes: true, 
        attributeOldValue: true,
        childList: false, 
        subtree: false, 
        characterData: false,
        characterDataOldValue: false
    };
    /* childList, attributes, characterData */
    
    observer = new MutationObserver(mutated);
    observer.observe(p, config);
}

function mutated(mutationList){
    console.log( mutationList );    
    //target - Element
    //addNodes - NodeList
    //removedNodes - NodeList
    //oldValue 
    //attributeName
    //attributeNamespace
    //nextSibling - Element / textNode
    //previousSibling - Element / textNode
    //type 'attributes' or 'childList'
}