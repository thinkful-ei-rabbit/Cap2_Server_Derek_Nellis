class _Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Words {
  constructor() {
    this.head = null;
  }

  setHead(value) {
    this.head = new _Node(value);
  }

  push(value) {
    if (this.head.value.id === value.id) return;

    const node = new _Node(value);

    if (!this.head.next) {
      this.head.next = node;
    } else if (this.head.value.next === value.id) {
      node.next = this.head.next;
      this.head.next = node;
    } else {
      let curr = this.head.next;
      let prev;

      while (curr && curr.value.id !== value.next) {
        prev = curr;
        curr = curr.next;
      }

      if (curr) {
        node.next = curr;
        prev.next = node;
      } else {
        prev.next = node;
      }
    }
  }

  updateWord(word) {
    this.head = this.head.next;
    let curr = this.head;
    let prev;
    let i = word.memory_value;
    while (curr && i > 0) {
      prev = curr;
      curr = curr.next;
      i--;
    }

    if (curr) {
      word.next = curr.value.id;
    } else {
      word.next = null;
    }

    const node = new _Node(word);

    node.next = curr;
    prev.next = node;
    prev.value.next = node.value.id;
  }

  getAll() {
    const words = [];

    let curr = this.head;
    while (curr) {
      words.push(curr.value);
      curr = curr.next;
    }

    return words;
  }
}

module.exports = { Words };
