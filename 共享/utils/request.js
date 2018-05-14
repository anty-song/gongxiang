var requestHandler = {
  params: {},
  success: function (res) {
    // success
  },
  fail: function (res) {
    // fail
  },
  complete: function (res) {
    // complete
  }
}

// GET 请求
function GET(url, requestHandler) {
  request(url, 'GET', { 'content-type': 'application/json' }, requestHandler)
}

// POST 请求
function POST(url, requestHandler) {
  request(url, 'POST', { 'content-type': 'application/x-www-form-urlencoded' }, requestHandler)
}

function request(url, method, contentType, requestHandler) {
  // 可以对 params 加密等处理
  var params = requestHandler.params;

  wx.request({
    url: url,
    data: params,
    method: method,
    header: contentType,
    success: function (res) {
      requestHandler.success(res)
    },
    fail: function (res) {
      requestHandler.fail(res)
    },
    complete: function (res) {
      requestHandler.complete(res)
    }
  })
}
module.exports = {
  GET: GET,
  POST: POST
}