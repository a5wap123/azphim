const ex = module.exports 

ex.findObjectByKey = (array, key, value) => {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

ex.findArrayByKey = (array, key, value) => {
  let arr = []
    for (let i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            arr.push(array[i])
        }
    }
    return arr;
}