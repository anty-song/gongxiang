const COMMON_URL = 'https://wx.voteyun.com/interface/';
module.exports = {
  INDEXLIST: COMMON_URL,
  ACTIVE: COMMON_URL + 'show.php',
  _ACTIVE: COMMON_URL + 'show.php?action=notfirst',
  HISTORY: COMMON_URL + 'history.php',
  RANK: COMMON_URL + 'show.php?action=paiming',
  RULE: COMMON_URL + 'show.php?action=rule',
  ITEMPAGE: COMMON_URL + 'list.php',
  VOTE: COMMON_URL + 'vote.php',
  GETCODE: COMMON_URL + 'share.php',
  GETYZMIMG: 'https://wx.voteyun.com/api/captchar.png.php',
  CHECKYZM: 'https://wx.voteyun.com/api/captcha.check.php',
  LOGIN: COMMON_URL + 'openid.php'
}