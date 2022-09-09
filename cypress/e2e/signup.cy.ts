const mailDomain = Cypress.env("MAILOSAUR_DOMAIN")
const emailAddress = 'mattarli@' + mailDomain

describe('アカウント登録', () => {
  cy.session(() => {
    it('ログイン画面に移動', () => {
      cy.visit('/signup')
    })
    it('IDを入力', () => {
      cy.get('[id="userid"]').type("user")
    })
    it('名前を入力', () => {
      cy.get('[id="name"]').type("exUser")
    })
    it('メールアドレスを入力', () => {
      cy.get('[id="email"]').type(emailAddress)
    })
    it('パスワードを入力', () => {
      cy.get('[id="password"]').type("MattarLiDev@1234")
    })
    it('規約に同意', () => {
      cy.get('[id="privacy"]').check()
    })
    it('登録', () => {
      cy.get('button[id="signup"]').click()
    })
  })
})

describe('登録完了', () => {
  it('ルートに移動', () => {
    cy.wait(2000)
    cy.location('pathname')
      .should('eq', '/')
  })
  it('メールをチェック', () => {
    cy.wait(1000)
    cy.mailosaurGetMessage(Cypress.env("MAILOSAUR_ID"), {
      sentTo: emailAddress
    }).then(email => {
      expect(email.subject).to.equal('メールアドレス認証のお願い');
    })
  })
})