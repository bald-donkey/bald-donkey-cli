const path = require('path')
const axios = require('axios');
const ora = require('ora');
const Inquirer = require('inquirer');
const { promisify } = require('util');
let downloadGitRepo = require('download-git-repo');
downLoadGitRepo = promisify(downloadGitRepo);
const { downloadDirectory } = require('./utils/constants');
let ncp = require('ncp');
ncp = promisify(ncp);


// ①. 获取仓库列表
const fetchRepoList = async () => {
  // 获取当前项目的所有分支，这个项目的分支均是项目模板
  const {
    data,
  } = await axios.get('https://api.github.com/orgs/bald-donkey-cli/repos');
  return data;
};

// ②. 封装loading
const waitFetchAddLoading = (fn, message) => async (...args) => {
  const spinner = ora(message);
  spinner.start(); // 开始loading
  const result = await fn(...args);
  spinner.succeed(); // 结束loading
  return result;
};

// ③. 抓取tag列表
const fetchTagList = async (repo) => {
  const {
    data,
  } = await axios.get(`https://api.github.com/repos/bald-donkey-cli/${repo}/tags`);
  return data;
}

// ④. 下载项目
const download = async (repo, tag) => {
  let api = `https://api.github.com/repos/bald-donkey-cli/${repo}`; // 下载项目
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`;// 将模板下载到对应的目录中
  await downloadGitRepo(api, dest);
  return dest; // 返回下载目录
};

module.exports = async (projectName) => {
  // console.log(projectName);

  // 1. 获取项目模板
  let repos = await waitFetchAddLoading(fetchRepoList, 'fetching template......')();

  // 选择模板
  repos = repos.map((item) => item.name);
  const {
    repo,
  } = await Inquirer.prompt({
    name: 'repo', // 获取选择后的结果
    type: 'list', // 什么方式显示在命令行
    message: 'please select a template to create project', // 提示信息
    choices: repos, // 选择的数据
  });
  // console.log(repo);

  // 2. 获取对应的版本号
  let tags = await waitFetchAddLoading(fetchTagList, 'fetching tags......')(repo);
  tags = tags.map((item) => item.name)

  // 选择版本号
  const {
    tag,
  } = await Inquirer.prompt({
    name: 'tag', // 获取选择后的结果
    type: 'list', // 什么方式显示在命令行
    message: 'please select a template to create project', // 提示信息
    choices: tags, // 选择的数据
  });
  // console.log(tag);

  // 3. 下载项目 返回一个临时的存放目录
  const target = await waitFetchAddLoading(download, 'download template ......')(repo, tag);

  // 4. 将下载的文件拷贝到当前执行命令的目录下
  await ncp(target, path.join(path.resolve(), projectName));
}