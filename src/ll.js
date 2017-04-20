/* eslint no-param-reassign: ["error", { "props": false }] */

export const isValid = node => node.left && node.right;
export const isEmpty = node => node.left === node;
export const createEmpty = () => {
  const node = {};
  node.left = node;
  node.right = node;
  return node;
};

export const forEach = (list, action) => {
  let node = list && list.right;
  while (node && node !== list) {
    const next = node.right;
    action(node);
    node = next;
  }
};

export const insertAfter = (node, properties) => {
  if (!isValid(node)) {
    throw new Error('Cannot insert at invalid node');
  }
  const newNode = {
    ...properties,
    left:  node,
    right: node.right,
  };
  newNode.left.right = newNode;
  newNode.right.left = newNode;
  return newNode;
};

export const remove = (node) => {
  if (isValid(node)) {
    node.right.left = node.left;
    node.left.right = node.right;
    node.right = null;
    node.left = null;
  }
  return node;
};

export const next = node => node.right;
export const previous = node => node.left;
