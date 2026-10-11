// ===== Data Types =====
let isIceCreamCold = true
let king = 23
let color = "blue"
let prime = [2, 3, 5, 7, 11, 13, 17, 19, 23]
const nbMonth = 12

console.log("Number:", king)
console.log(`Number ${king}`)
console.log(`Number ${king * 2}`)

// ===== Named Function =====
function add(a, b) {
  return a + b
}
console.log('Function add:', add(2, 3))

// ===== Anonymous Function =====
let added = function (x, y) {
  return x + y
}
console.log('Function added:', added(2, 3))

// ===== Arrow Function =====
let mult2 = (x) => 2 * x
console.log('Arrow mult2:', mult2(5))

// ===== Classes =====
class Animal {
  move(distanceInMeters = 0) {
    console.log(`Animal moved ${distanceInMeters}m.`)
  }
}

class Dog extends Animal {
  bark() {
    console.log('Woof! Woof!')
  }
}

const dog = new Dog()
dog.bark()
dog.move(10)
dog.bark()

// ===== Object Literal =====
let boss = {
  name: "Michael Scott",
  phone: "555-555-5555",
  address: "Scranton, PA"
}
console.log("The world's best boss is:", boss.name, boss.phone, boss.address)

// ===== Spread Operator =====
let newBoss = { ...boss }
newBoss.name = "Andy Bernard"
console.log("The new boss is:", newBoss.name)

// ===== Map =====
let myarray = ['Microsoft', 'Google']
let printIt = (value) => console.log(value)
myarray.map(printIt)

// ===== Filter =====
let nums = [1, 2, 5, 6, 10, 20, 100, 200]
const smallNums = nums.filter((elt) => elt < 20)
console.log(smallNums)