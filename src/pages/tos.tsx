import Footer from 'components/Footer'
import Header from 'components/Header'
import Head from 'next/head'

export default function TOS() {
  return (
    <div className="">
      <Head>
        <title>利用規約 | mattar.li</title>
      </Head>
      <Header />
      <article className="pt-10 mb-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h1 className="text-4xl font-bold mb-3">利用規約</h1>
        <details className="my-3 prose lg:prose-md">
          <summary>利用規約本文</summary>
          <p>
            この利用規約（以下、「本規約」といいます。）は、Mattar（以下、「当団体」といいます。）がこのウェブサイト上で提供するサービス「mattar.li」（以下、「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
          </p>

          <h2>第1条（適用）</h2>
          <ol>
            <li>
              本規約は、ユーザーと当団体との間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </li>
            <li>
              当団体は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下、「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
            </li>
            <li>
              本規約の規定が前条の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。
            </li>
          </ol>

          <h2>第2条（利用登録）</h2>
          <ol>
            <li>
              本サービスにおいては、登録希望者が本規約に同意の上、当団体の定める方法によって利用登録を申請し、当団体がこの承認を登録希望者に通知することによって、利用登録が完了するものとします。
            </li>
            <li>
              当団体は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
              <ol>
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当団体が利用登録を相当でないと判断した場合</li>
              </ol>
            </li>
          </ol>

          <h2>第3条（ユーザーIDおよびパスワードの管理）</h2>
          <ol>
            <li>
              ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            </li>
            <li>
              ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。当団体は、ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。
            </li>
            <li>
              ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は、当団体に故意又は重大な過失がある場合を除き、当団体は一切の責任を負わないものとします。
            </li>
          </ol>

          <h2>第4条（禁止事項）</h2>
          <p>
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ol>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>
              当団体、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
            </li>
            <li>当団体のサービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>
              当団体のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
            </li>
            <li>
              当団体、本サービスの他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為
            </li>
            <li>
              以下の表現を含み、または含むと当団体が判断する内容を本サービス上に投稿し、または送信する行為
              <ol>
                <li>過度に暴力的な表現</li>
                <li>露骨な性的表現</li>
                <li>
                  人種、国籍、信条、性別、社会的身分、門地等による差別につながる表現
                </li>
                <li>自殺、自傷行為、薬物乱用を誘引または助長する表現</li>
                <li>その他反社会的な内容を含み他人に不快感を与える表現</li>
              </ol>
            </li>
            <li>
              以下を目的とし、または目的とすると当団体が判断する行為
              <ol>
                <li>
                  営業、宣伝、広告、勧誘、その他営利を目的とする行為（当団体の認めたものを除きます。）
                </li>
                <li>性行為やわいせつな行為を目的とする行為</li>
                <li>面識のない異性との出会いや交際を目的とする行為</li>
                <li>他のユーザーに対する嫌がらせや誹謗中傷を目的とする行為</li>
                <li>
                  当団体、本サービスの他のユーザー、または第三者に不利益、損害または不快感を与えることを目的とする行為
                </li>
                <li>
                  その他本サービスが予定している利用目的と異なる目的で本サービスを利用する行為
                </li>
              </ol>
            </li>
            <li>宗教活動または宗教団体への勧誘行為</li>
            <li>その他、当団体が不適切と判断する行為</li>
          </ol>

          <h2>第5条（本サービスの提供の停止等）</h2>
          <ol>
            <li>
              当団体は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              <ol>
                <li>
                  本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
                </li>
                <li>
                  地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
                </li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当団体が本サービスの提供が困難と判断した場合</li>
              </ol>
            </li>
            <li>
              当団体は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
            </li>
          </ol>

          {/*<h2>第7条（著作権）</h2>
          <ol>
            <li>
              ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像や映像等の情報に関してのみ、本サービスを利用し、投稿ないしアップロードすることができるものとします。
            </li>
            <li>
              ユーザーが本サービスを利用して投稿ないしアップロードした文章、画像、映像等の著作権については、当該ユーザーその他既存の権利者に留保されるものとします。ただし、当団体は、本サービスを利用して投稿ないしアップロードされた文章、画像、映像等について、本サービスの改良、品質の向上、または不備の是正等ならびに本サービスの周知宣伝等に必要な範囲で利用できるものとし、ユーザーは、この利用に関して、著作者人格権を行使しないものとします。
            </li>
            <li>
              前項本文の定めるものを除き、本サービスおよび本サービスに関連する一切の情報についての著作権およびその他の知的財産権はすべて当団体または当団体にその利用を許諾した権利者に帰属し、ユーザーは無断で複製、譲渡、貸与、翻訳、改変、転載、公衆送信（送信可能化を含みます。）、伝送、配布、出版、営業使用等をしてはならないものとします。
            </li>
          </ol>*/}

          <h2>第6条（利用制限および登録抹消）</h2>
          <ol>
            <li>
              当団体は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、投稿データを削除し、ユーザーに対して本サービスの全部もしくは一部の利用を制限しまたはユーザーとしての登録を抹消することができるものとします。
              <ol>
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>当団体からの連絡に対し、一定期間返答がない場合</li>
                <li>
                  本サービスについて、最終の利用から一定期間利用がない場合
                </li>
                <li>
                  その他、当団体が本サービスの利用を適当でないと判断した場合
                </li>
              </ol>
            </li>
            <li>
              前項各号のいずれかに該当した場合、ユーザーは、当然に当団体に対する一切の債務について期限の利益を失い、その時点において負担する一切の債務を直ちに一括して弁済しなければなりません。
            </li>
            <li>
              当団体は、本条に基づき当団体が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
            </li>
          </ol>

          <h2>第7条（退会）</h2>
          <p>
            ユーザーは、当団体の定める退会手続により、本サービスから退会できるものとします。
          </p>

          <h2>第8条（保証の否認および免責事項）</h2>
          <ol>
            <li>
              当団体は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
            </li>
            <li>
              当団体は、本サービスに起因してユーザーに生じたあらゆる損害について、当団体の故意又は重過失による場合を除き、一切の責任を負いません。ただし、本サービスに関する当団体とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
            </li>
            <li>
              前項ただし書に定める場合であっても、当団体は、当団体の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（当団体またはユーザーが損害発生につき予見し、または予見し得た場合を含みます。）について一切の責任を負いません。また、当団体の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害の賠償は、ユーザーから当該損害が発生した月に受領した利用料の額を上限とします。
            </li>
            <li>
              当団体は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            </li>
          </ol>

          <h2>第9条（サービス内容の変更等）</h2>
          <p>
            当団体は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。
          </p>

          <h2>第10条（利用規約の変更）</h2>
          <ol>
            <li>
              当団体は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
              <ol>
                <li>本規約の変更がユーザーの一般の利益に適合するとき。</li>
                <li>
                  本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。
                </li>
              </ol>
            </li>
            <li>
              当団体はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。
            </li>
          </ol>

          <h2>第11条（個人情報の取扱い）</h2>
          <p>
            当団体は、本サービスの利用によって取得する個人情報については、当団体「プライバシーポリシー」に従い適切に取り扱うものとします。
          </p>

          <h2>第12条（通知または連絡）</h2>
          <p>
            ユーザーと当団体との間の通知または連絡は、当団体の定める方法によって行うものとします。当団体は,ユーザーから,当団体が別途定める方式に従った変更届け出がない限り,現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い,これらは,発信時にユーザーへ到達したものとみなします。
          </p>

          <h2>第13条（権利義務の譲渡の禁止）</h2>
          <p>
            ユーザーは、当団体の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          </p>

          <h2>第14条（準拠法・裁判管轄）</h2>
          <ol>
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>
              本サービスに関して紛争が生じた場合には、当団体の本店所在地を管轄する裁判所を専属的合意管轄とします。
            </li>
          </ol>

          <p>以上</p>
        </details>
        <h2 className="text-2xl font-bold mb-3">利用規約の要約</h2>
        <h3 className="text-xl font-bold my-3">❌やってはいけないこと</h3>
        <ul className="list-disc ml-10">
          <li>法律に違反すること</li>
          <li>政治・経済・国際情勢・事件に関する投稿</li>
          <li>デモ活動・反対運動・人や団体に対する批判</li>
          <li>運営の妨害</li>
          <li>なりすまし</li>
          <li>他者への妨害</li>
          <li>過度な性的表現</li>
          <li>アカウント情報の商用利用</li>
          <li>広告・宣伝・宗教勧誘</li>
          <li>差別・自傷・薬物に関する投稿</li>
        </ul>
        <h3 className="text-xl font-bold my-3">⚠️注意したほうがよいこと</h3>
        <ul className="list-disc ml-10">
          <li>
            当サービス上で個人間の問題が発生した場合、当団体は責任を負いません
          </li>
          <li>反社会的勢力は利用できません</li>
          <li>運営の判断により投稿が削除される可能性があります</li>
          <li>規約違反を確認した場合アカウントを凍結または削除します</li>
        </ul>
      </article>
      <Footer />
    </div>
  )
}
