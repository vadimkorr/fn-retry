const main = async () => {
  const examples = [
    require('./fn-retry').main,
    require('./fn-retry-with-fibonacci').main,
  ]

  for (const example of examples) {
    console.log('\n================================\n')
    await example()
  }
}

main()
