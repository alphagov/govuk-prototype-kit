const id = setTimeout(() => console.log('timer'), 1500)

setInterval(() => {
  console.log(id)
}, 300)