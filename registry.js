export default class FormErrorRegistry {
  #elements = new Set();

  register(element) {
    this.#elements.add(element);
  }
}
