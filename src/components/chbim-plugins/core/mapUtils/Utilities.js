/**
 * @function 求两个数组的交集
 * @description 数组为简单数组
 * @returns {array} 正常的数组
 * */
const intersection = (aArray, bArray) => {
  if (aArray && bArray) {
    const bArraySet = new Set(bArray);
    const resultArray = aArray.filter((item) => bArraySet.has(item));
    return Array.from(resultArray);
  }
};

/**
 * @function 求两个数组的并集
 * @description 数组为简单数组
 * @returns {array} 正常的数组
 * */
const union = (aArray, bArray) => {
  if (aArray && bArray) {
    const resultArray = new Set([...aArray, ...bArray]);
    return Array.from(resultArray);
  }
};

/**
 * @function 求两个数组的差集;数组aArray相对于bArray所没有的
 * @description 数组为简单数组
 * @returns {array} 正常的数组
 * */
const difference = (aArray, bArray) => {
  if (aArray && bArray) {
    const bArraySet = new Set(bArray);
    const resultArray = aArray.filter((item) => !bArraySet.has(item));
    return Array.from(resultArray);
  }
};

/**
 * @function 辅助函数 判断是否是纯粹对象
 * @description 判读对象
 * @returns {object} 正常对象
 * */
const isPlainObject = (obj) => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

/**
 * @function 主函数 对象深度合并
 * @description
 * @returns {object} 合并后的对象
 * */
function assignDeep() {
  const args = Array.from(arguments);
  if (args.length < 2) return args[0];
  let result = args[0];
  args.shift();
  args.forEach((item) => {
    if (isPlainObject(item)) {
      if (!isPlainObject(result)) result = {};
      for (let key in item) {
        if (result[key] && isPlainObject(item[key])) {
          result[key] = assignDeep(result[key], item[key]);
        } else {
          result[key] = item[key];
        }
      }
    } else if (item instanceof Array) {
      if (!(result instanceof Array)) result = [];
      item.forEach((arrItem, arrIndex) => {
        if (isPlainObject(arrItem)) {
          result[arrIndex] = assignDeep(result[arrIndex]);
        } else {
          result[arrIndex] = arrItem;
        }
      });
    }
  });
  return result;
}

/**
 * @function 对象深度合并
 * @param  { object } object1 - 老对象
 * @param  { object } object2 - 新对象
 * @description 比较两个对象的属性值是否相等，如果相等则不作处理，否则将新属性值添加到老对象中 最后返回出去
 * @returns {object}
 * */
const compareObjects = (obj1, obj2) => {
  const diff = {}; // 存放不同属性及其值的新对象
  Object.keys(obj1).forEach((key) => {
    if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      // 如果当前键对应的值也是对象类型，则进行深度比较
      if (
        Object.keys(obj1[key]).length === 0 &&
        Object.keys(obj2[key]).length !== 0
      ) {
        diff[key] = obj2[key];
      } else {
        const subDiff = compareObjects(obj1[key], obj2[key]);
        if (!isEmptyObj(subDiff)) {
          diff[key] = subDiff;
        }
      }
    } else if (obj1[key] !== obj2[key]) {
      // 如果当前键对应的值不相等，将该键添加到diff对象中
      diff[key] = obj2[key];
    }
  });
  return diff;
};

/**
 * @function 判断空
 * @param  { object } obj
 * @description 判断一个对象是否为空（没有任何属性）
 * @returns { boolean }
 * */
const isEmptyObj = (obj) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export { intersection, union, difference, assignDeep, compareObjects };
