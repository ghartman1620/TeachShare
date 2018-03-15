// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
    "default e2e tests": function(browser) {
        // automatically uses dev Server port from /config.index.js
        // default: http://localhost:8080
        // see nightwatch.conf.js
        const devServer = browser.globals.devServerURL;

        browser
            .url(devServer)
            .waitForElementVisible("#app", 1000)
            .assert.title("teach-share")
            .setValue("input[id=searchBoxInput]", "nightwatch")
            .click("button[id=searchBoxBtn]")
            .pause(1000)
            .click('a[href="/create"]')
            // .assert.containsText("label[for=bottomNavTitle]", "Title:")
            // .pause(1000)
            // .setValue("input[id=titleTextbox]", "fake title")
            // .pause(1000)
            // .click("input[id=tagTextbox]")
            // .waitForElementVisible("div[id=bottomNavTitle]", 1000)
            // .assert.containsText("div[id=bottomNavTitle]", "fake title")
            .end();
    }
};