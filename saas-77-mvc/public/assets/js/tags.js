const tagContainer = document.querySelector('.tag-container');
// the input the user sees and interracts
const input = document.querySelector('.tag-container input');
// the copy of the input that's hidden and tags values are saved
const inputcopy = document.askform.copyKeywordsID;
// variable that stores the input and from where the inputcopy gets the values
let inputFormatted = "";
// use set to avoid dublicates
let tags = new Set();

function getKeywords() {
    return tags;
}

/* Returns a camelCase string */
function toCamelCase(sentenceCase) {
    let camelCase = "";
    sentenceCase.replace(/  +/g, ' ').split(" ").forEach(function (el, idx) {
        let elLowerCase = el.toLowerCase();
        camelCase += (idx === 0 ? elLowerCase : elLowerCase[0].toUpperCase() + elLowerCase.slice(1));
    });
    return camelCase;
}

/* Creates the element that shows up in the field, with value equal to tag */
function createTag(label) {
    const div = document.createElement('div');
    div.setAttribute('class', 'tag');
    const span = document.createElement('span');
    span.innerHTML = label;
    const closeIcon = document.createElement('i');
    closeIcon.setAttribute('class', 'fa fa-times-circle');
    closeIcon.setAttribute('data-item', label);
    div.appendChild(span);
    div.appendChild(closeIcon);
    return div;
}

/* Clears all tags to add the new in case of a change/addon */
function clearTags() {
    document.querySelectorAll('.tag').forEach(tag => {
        tag.parentElement.removeChild(tag);
    });
}

/* Adds the tags by using clearTags and createTag (foreach tag) */
function addTags() {
    clearTags();
    Array.from(tags).reverse().forEach(tag => {
        tagContainer.prepend(createTag(tag));
    });
}

/* Listener for enter key */
input.addEventListener('keyup', (e) => {

    let camelCaseTag;

    // if key is Enter
    if (e.key === 'Enter') {
        // get all values split them on comma
        e.target.value.split(',').forEach(tag => {
            // does not get tags that are empty or only spaces
            if (tag !== "" && tag.replace(/\s/g, '').length) {
                // converts tag to camelCase
                camelCaseTag = toCamelCase(tag.trim());
                // add every time the tag to the inputFormatted
                if (inputFormatted === "") inputFormatted = camelCaseTag;
                else inputFormatted = inputFormatted + "," + camelCaseTag;

                // add to Set 'tags' the tag every time
                tags.add(toCamelCase(tag.trim()))
            }
        });

        // create the tags
        addTags();

        // add the formatted input to inputcopy (which is the field that holds the data that will be sent to backend)
        inputcopy.value = inputFormatted;
        input.value = '';
    }
});
  
document.addEventListener('click', (e) => {
    // convert tags(set) to array so it is iterable
    tagsArr = Array.from(tags);
    if (e.target.tagName === 'I') {
        const tagLabel = e.target.getAttribute('data-item');
        // find the index of the item to be deleted from set
        const index = Array.from(tags).indexOf(tagLabel);
        // construct the new set with the deleted item missing
        tags = new Set([...tagsArr.slice(0, index), ...tagsArr.slice(index+1)]);

        // from the new tags construct the new string of input copy
        inputcopy.value = [...tags].join(',');
        // set the new input string to the inputFormatted as well
        inputFormatted = inputcopy.value;
        addTags();
    }
})
  
input.focus();



