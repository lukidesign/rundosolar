// 生产环境 mock 注入入口 —— vite-plugin-mock 会在构建时把它打进 bundle
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer';

// 逐个导入，确保打包后类型 & 路径稳定
import alarm from '../mock/alarm';
import auth from '../mock/auth';
import dashboard from '../mock/dashboard';
import hiddenFlaw from '../mock/hidden-flaw';
import inspection from '../mock/inspection';
import station from '../mock/station';

export function setupProdMockServer() {
  createProdMockServer([
    ...alarm,
    ...auth,
    ...dashboard,
    ...hiddenFlaw,
    ...inspection,
    ...station,
  ]);
}
