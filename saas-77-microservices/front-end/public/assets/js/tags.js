const tagContainer = document.querySelector('.tag-container');
const input = document.querySelector('.tag-container input');
const inputcopy = document.askform.copyKeywordsID;
let tags = new Set()

function getKeywords() {
  return tags;
}

function toCamelCase(sentenceCase) {
    let camelCase = "";
    sentenceCase.replace(/  +/g, ' ').split(" ").forEach(function (el, idx) {
        let elLowerCase = el.toLowerCase();
        camelCase += (idx === 0 ? elLowerCase : elLowerCase[0].toUpperCase() + elLowerCase.slice(1));
    });
    return camelCase;
}

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

function clearTags() {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.parentElement.removeChild(tag);
  });
}

function addTags() {
  clearTags();
  Array.from(tags).reverse().forEach(tag => {
    tagContainer.prepend(createTag(tag));
  });
}

input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      e.target.value.split(',').forEach(tag => {
      if (tag !== "") tags.add(toCamelCase(tag.trim()));
      });

      addTags();
      inputFormatted = toCamelCase(input.value.trim())

      if (inputcopy.value !== "") inputcopy.value = inputcopy.value + "," + inputFormatted;
      else inputcopy.value = inputFormatted;

      input.value = '';
    }
});
document.addEventListener('click', (e) => {
  tagsArr = Array.from(tags);
  if (e.target.tagName === 'I') {
    const tagLabel = e.target.getAttribute('data-item');
    const index = Array.from(tags).indexOf(tagLabel);
    tags = new Set([...tagsArr.slice(0, index), ...tagsArr.slice(index+1)]);
    addTags();    
  }
})

input.focus();