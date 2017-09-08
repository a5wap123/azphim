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
ex.getRandomIntInclusive=(min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
  }