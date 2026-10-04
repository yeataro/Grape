export default {
 testDir: 'C:/Users/user/source/Grape/production/tests/browser', fullyParallel:false,workers:1,timeout:60000,retries:0,
 reporter:[['list'],['json',{outputFile:process.env.GRAPE_EVIDENCE_DIR+'/browser-results.json'}]],
 use:{baseURL:'http://127.0.0.1:4176',viewport:{width:1440,height:1000},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4176 --strictPort',cwd:'C:/Users/user/source/Grape/production',url:'http://127.0.0.1:4176',reuseExistingServer:false},
 projects:[{name:'chromium',use:{browserName:'chromium'}}]
};
