
const { version } = require('./utils/constants');
const path = require('path');
// 获取版本号
const program = require("commander");


// 配置3个指令命令
const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: [
      'bald-donkey-cli create <project-name>',
    ],
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'bald-donkey-cli config set <k><v>',
      'bald-donkey-cli config get <k>',
    ],
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: [],
  },
};

// 循环创建命令
Reflect.ownKeys(mapActions).forEach((action) => {
  program
    .command(action) // 配置命令的名字
    .alias(mapActions[action].alias) // 命令的别名
    .description(mapActions[action].description) // 命令对应的描述
    .action(() => {
      // 访问不到对应的命令，就打印找不到命令
      if (action === '*') {
        console.log(mapActions[action].description);
      } else {
        // console.log(action);

        // 截取命令
        // bald-donkey-cli create xxx [node, bald-donkey-cli, create, xxx]
        require(path.resolve(__dirname, action))(...process.argv.slice(3));
      }
    });
});

// 监听用户的help事件
program.on('--help', () => {
  console.log('\nExamples:');
  Reflect.ownKeys(mapActions).forEach((action) => {
    mapActions[action].examples.forEach((example) => {
      console.log(`${example}`);
    });
  });
});

// process.argv 就是用户在命令行中传入的参数
program.version(version).parse(process.argv);

