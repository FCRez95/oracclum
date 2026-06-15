import { landingUrl } from "@/config/appConfig";

export default function TermsOfUse() {
    const plansUrl = `${landingUrl}/planos`;

    return (
        <div className="flex flex-col text-content pb-medium gap-default prose prose-neutral max-w-none text-justify leading-relaxed overflow-x-hidden">
            <h1 className="flex font-bold justify-center">
                TERMOS DE USO DEMONSTRATIVOS DA PLATAFORMA ORACCLUM
            </h1>
            <div>
                <strong>Versão</strong>: 24 de novembro de 2025.
            </div>
            <h2 className="flex font-bold justify-center">
                PREÂMBULO
            </h2>
            <div className="indent-[3rem]">
                <p>Estes Termos de Uso (doravante “Termos”) descrevem o modelo de licenciamento da Plataforma Oracclum e são mantidos neste repositório como material demonstrativo de portfólio. A versão pública deste projeto não representa uma operação comercial ativa nem disponibiliza assessoria real de implantação.</p>
                <p>A utilização da Plataforma em modo demo implica na aceitação destes Termos demonstrativos e da Política de Privacidade demonstrativa.</p>
            </div>
            <h2 className="font-bold">
                GLOSSÁRIO
            </h2>
            <div className="indent-[3rem]">
                <p className="mb-medium">Para fins destes Termos, considera-se:</p>
                <ul className="list-none space-y-2">
                    <li>
                        a) <strong>LICENCIADO/USUÁRIO:</strong> a parte que contrata o licenciamento
                        de uso da Plataforma para a finalidade de rastreamento e gestão de dados de
                        campanhas de marketing digital realizadas em Provedor(es).
                    </li>

                    <li>
                        b) <strong>LICENCIANTE/ORACCLUM:</strong> a parte que desenvolveu a
                        Plataforma e é detentora da sua propriedade intelectual.
                    </li>

                    <li>
                        c) <strong>Partes:</strong> denominação conjunta para o LICENCIADO e a
                        ORACCLUM.
                    </li>

                    <li>
                        d) <strong>Plataforma:</strong> programa de computador em formato Web
                        (software), composto por módulos específicos, de propriedade da ORACCLUM,
                        cujo uso é licenciado mediante valor determinado de acordo com os módulos
                        escolhidos e quantidades contratadas.
                    </li>

                    <li>
                        e) <strong>Provedor(es):</strong> terceiro(s) detentor(es) de
                        softwares/plataformas que possibilitam a realização de anúncios no ambiente
                        digital, como Meta, Google, Taboola, entre outros.
                    </li>

                    <li>
                        f) <strong>Plano:</strong> formato de contratação dos módulos escolhidos
                        pelo LICENCIADO para atender suas necessidades específicas. Os planos podem
                        ser: Iniciante (Inicial, Básico, Crescente), Intermediário (Essencial,
                        Expansivo, Escalado), ou Avançado (Sênior, Mestre, Ancient).
                    </li>

                    <li>
                        g) <strong>Implantação:</strong> momento em que representante(s) da
                        ORACCLUM realizará a integração da Plataforma com o(s) Provedor(es).
                    </li>
                </ul>
            </div>
            <h2 className="font-bold my-small">
                1. OBJETO DO LICENCIAMENTO
            </h2>
            <ol className="space-y-3">
                <li>
                    1.1. O presente Termo estabelece o licenciamento de uso da
                    Plataforma Oracclum, disponível no endereço eletrônico:
                    <a
                        href={landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline pl-extra-small"
                    >
                        {landingUrl}
                    </a>.
                </li>

                <li>
                    1.2. O licenciamento é cedido em caráter temporário, não
                    exclusivo e oneroso, pelo tempo definido na proposta comercial anexada ao
                    Plano escolhido.
                </li>

                <li>
                    1.3. O objeto principal é o rastreamento de dados em
                    marketplaces digitais e provedores de marketing digital por tráfego pago
                    (Meta Ads, Google Ads, Taboola, entre outros).
                </li>

                <li>
                    1.4. O objetivo de uso pelo LICENCIADO é a otimização da
                    alocação de recursos no marketing digital, especificamente relacionados à
                    gestão de tráfego e vendas online.
                </li>

                <li>
                    1.5. Constitui objeto deste Termo, ainda, a assessoria de
                    Implantação, que envolve a integração aos Provedores e o treinamento acerca
                    das funcionalidades da Plataforma.
                </li>
            </ol>


            <h2 className="font-bold my-small">
                2. RESPONSABILIDADES DA ORACCLUM (LICENCIANTE)
            </h2>
            <ol className="space-y-3">
                <li>
                    2.1. A ORACCLUM compromete-se a realizar o procedimento de
                    integração do LICENCIADO à Plataforma, promovendo as integrações com os
                    Provedores, conforme o Plano contratado.

                    <ol className="mt-2 space-y-2 pl-[3rem]">
                        <li>
                            2.1.1. O procedimento de integração incluirá a geração
                            da(s) UTM(s) (Módulo de Rastreamento Urchin) para rastreio da(s)
                            campanha(s).
                        </li>

                        <li>
                            2.1.2. A ORACCLUM realizará a integração da(s) API(s)
                            Key(s) com o(s) Provedor(es), bem como a integração para a captação de
                            dados do Funil perante os Provedor(es) que o permitirem. Não será possível
                            esta integração com Provedor(es) que não autorizem o procedimento.
                        </li>

                        <li>
                            2.1.3. O prazo para o procedimento de integração será
                            definido em comum acordo, conforme a complexidade e o fornecimento das
                            informações e/ou documentos necessários pelo LICENCIADO.
                        </li>
                    </ol>
                </li>

                <li>
                    2.2. A ORACCLUM deverá manter a Plataforma em perfeito
                    funcionamento, ressalvadas as manutenções necessárias para melhorias de
                    funcionalidades e aperfeiçoamento de segurança de dados.

                    <ol className="mt-2 pl-[3rem]">
                        <li>
                            2.2.1. Em caso de necessidade de manutenção que possa
                            interferir no funcionamento da Plataforma, a ORACCLUM deverá informar o
                            LICENCIADO com pelo menos 72 (setenta e duas) horas de antecedência,
                            determinando o prazo de suspensão de acesso.
                        </li>
                    </ol>
                </li>

                <li>
                    2.3. A ORACCLUM manterá um fluxo demonstrativo de suporte para que o
                    LICENCIADO possa visualizar, no contexto demonstrativo, como dúvidas e
                    eventuais problemas seriam tratados em uma operação real da Plataforma.
                </li>

                <li>
                    2.4. A ORACCLUM irá monitorar as políticas de integração com
                    o(s) Provedor(es). Na hipótese de inviabilização da integração por parte do(s)
                    Provedor(es), deverá informar o LICENCIADO, que poderá optar pela rescisão do
                    licenciamento, sem ônus para as Partes.
                </li>
            </ol>

            <h2 className="font-bold my-small">
                3. RESPONSABILIDADES E DEVERES DO LICENCIADO (USUÁRIO)
            </h2>
            <ol className="space-y-3">
                <li>
                    3.1. O LICENCIADO deve fornecer e manter atualizadas todas as
                    informações necessárias para que a ORACCLUM realize e mantenha em
                    funcionamento as integrações necessárias na Plataforma.
                </li>

                <li>
                    3.2. Para que o rastreamento de dados seja satisfatório, o
                    LICENCIADO deverá fornecer dados corretos e atualizados, mantendo sempre
                    vigentes as credenciais de acesso ao(s) Provedor(es).
                </li>

                <li>
                    3.3. O LICENCIADO declara ter ciência de que a Plataforma
                    possui ferramentas que permitem a criação, alteração e gestão de campanhas
                    diretamente no(s) Provedor(es), incluindo alterações de orçamento, status da
                    campanha, Custo por clique, sites vinculados, duplicação de campanhas, entre
                    outros.

                    <ol className="mt-2 pl-[3rem]">
                        <li>
                            3.3.1.
                            <strong className="pl-extra-small">
                                O LICENCIADO é o único responsável pelo processo de criação e alteração
                                das campanhas
                            </strong>
                            . Em caso de eventual suspensão, revisão ou punição pelo(s) Provedor(es),
                            nada terá a requerer perante a ORACCLUM.
                        </li>
                    </ol>
                </li>

                <li>
                    3.4. O LICENCIADO deve efetuar o pagamento dos valores de
                    acordo com o prazo acordado, sob pena de ter seu acesso desativado.
                </li>

                <li>
                    3.5. O LICENCIADO é responsável por criar e manter seguras
                    suas credenciais de acesso (usuário e senha) à Plataforma e Provedor(es), bem
                    como possuir o meio de recuperação de senha escolhido, tendo em vista que a
                    ORACCLUM não possui acesso a estes dados por motivos de segurança.
                </li>

                <li>
                    3.6. O LICENCIADO se obriga a zelar pela imagem da ORACCLUM,
                    abstendo-se de divulgar vídeos ou manifestações em redes sociais sobre
                    impasses ocorridos, que deverão ser sanados entre as Partes, sob pena de
                    perdas e danos e indenização por danos à imagem da ORACCLUM.
                </li>
            </ol>

            <h2 className="font-bold my-small">
                4. PAGAMENTO E VIGÊNCIA
            </h2>
            <ol className="space-y-3">
                <li>
                    4.1. O licenciamento de software e/ou a prestação dos serviços
                    serão remunerados de acordo com o Plano escolhido pelo LICENCIADO e os valores
                    previstos na Proposta Comercial correspondente.
                </li>

                <li>
                    4.2. Os valores cobrados de forma recorrente poderão sofrer
                    acréscimos caso haja aumento da(s) quantidade(s) contratada(s) e/ou da
                    utilização de outros recursos do(s) Sistema(s) acima das condições inicialmente
                    previstas, mediante prévia anuência do LICENCIADO.
                </li>

                <li>
                    4.3. Os valores relativos aos serviços prestados mensalmente
                    serão reajustados a cada 12 (doze) meses pelo índice acordado na Proposta
                    Comercial, acumulado no período.
                </li>

                <li>
                    4.4. A ORACCLUM não é responsável por financiar nenhuma etapa
                    relacionada ao tráfego pago.
                </li>

                <li>
                    4.5. O prazo de vigência poderá ser determinado (modalidade
                    anual) ou indeterminado (modalidade mensal por recorrência), a ser definido
                    pelo LICENCIADO ao optar a modalidade de contratação constante no endereco
                    eletrônico: {plansUrl}.

                    <ol className="mt-2 pl-[3rem] space-y-2">
                        <li>
                            4.5.1. Em caso de contratação na modalidade anual, não
                            haverá ressarcimento do valor pago pelo LICENCIADO, seja à vista ou a
                            prazo, após o período de 7 (sete) dias para o exercício do direito de
                            arrependimento. O direito de acesso será mantido pelos 12 (doze) meses
                            contratados.
                        </li>

                        <li>
                            4.5.2. Na hipótese de contratação mensal, havendo 05
                            (cinco) dias de atraso no pagamento do valor devido, o acesso do
                            LICENCIADO à Plataforma será desativado.
                        </li>

                        <li>
                            4.5.3. Em decorrência da desativação por inadimplemento,
                            os dados vinculados às campanhas e Provedor(es) serão mantidos por apenas
                            30 (trinta) dias. Após esse período, se o pagamento não for normalizado,
                            os dados serão descartados e será necessária nova contratação.
                        </li>
                    </ol>
                </li>
            </ol>

            <h2 className="font-bold my-small">
                5. PROPRIEDADE INTELECTUAL (PI)
            </h2>
            <ol className="space-y-3">
                <li>
                    5.1. A Plataforma objeto destes Termos, assim como seus
                    manuais, documentação técnica, informações, nomes, marcas e demais sinais
                    distintivos, <strong>são de propriedade exclusiva da ORACCLUM</strong>.
                </li>

                <li>
                    5.2. O LICENCIADO tem permissão de uso apenas nos limites e
                    para os fins previstos nestes Termos, não havendo qualquer alteração nos
                    direitos sobre tecnologias, programas e outros relacionados, que
                    permanecerão como propriedade da ORACCLUM.
                </li>

                <li>
                    5.3. Quaisquer implementações ou melhorias feitas na
                    Plataforma, a pedido ou não do LICENCIADO, serão de propriedade exclusiva da
                    ORACCLUM, podendo ser incorporadas à Plataforma e utilizadas como lhe
                    convier, sem que o LICENCIADO possa reivindicar direitos pecuniários, de uso,
                    comercialização ou autorais.
                </li>

                <li>
                    5.4. É <strong>expressamente vedado</strong> ao LICENCIADO
                    ou a terceiros a quem eventualmente dê acesso à Plataforma:
                    <ul className="mt-2 pl-[3rem] list-none space-y-2">
                        <li>
                            a) Copiar, sublicenciar, ceder, vender, dar em locação ou
                            garantia, alienar de qualquer forma, ou transferir, total ou
                            parcialmente, a Plataforma, seus módulos e/ou quaisquer
                            componentes/partes.
                        </li>
                        <li>
                            b) Adulterar, modificar as características da
                            Plataforma, ampliá-los ou alterá-los de qualquer forma.
                        </li>
                        <li>
                            c) Excluir ou alterar, total ou parcialmente, os avisos
                            de reserva de direito existentes na Plataforma e na sua documentação.
                        </li>
                    </ul>
                </li>

                <li>
                    5.5. A infração a qualquer disposição sobre Propriedade
                    Intelectual autoriza a ORACCLUM a cobrar do LICENCIADO o valor de
                    R$150.000,00 (cento e cinquenta mil reais), sem prejuízo à indenização
                    correspondente aos prejuízos sofridos, bem como sanções previstas na
                    legislação pertinente.
                </li>
            </ol>

            <h2 className="font-bold my-small">
                6. LIMITAÇÃO DE RESPONSABILIDADE E GARANTIAS
            </h2>
            <ol className="space-y-3">
                <li>
                    6.1. A ORACCLUM não se compromete a gerar nenhuma espécie de
                    retorno financeiro ou ganhos imediatos ou a longo prazo ao LICENCIADO. A
                    função é apenas disponibilizar uma Plataforma onde o LICENCIADO possa
                    melhorar a gestão de seus recursos a fim de obter melhor eficiência
                    operacional e de recursos.
                </li>

                <li>
                    6.2. Exclusões de Responsabilidade da ORACCLUM: A ORACCLUM
                    não se responsabiliza por falhas na prestação dos serviços e/ou pelos
                    resultados produzidos pela Plataforma nas seguintes hipóteses, mas sem se
                    limitar a elas:
                    <ul className="mt-2 pl-[3rem] list-none space-y-2">
                        <li>a) Caso fortuito ou eventos de força maior.</li>
                        <li>b) Problemas ocasionados por programa externo, como ataque de vírus.</li>
                        <li>c) Falha de operação, mau uso ou uso incorreto da Plataforma, inclusive em caso de imperícia, imprudência, negligência ou por conduta dolosa do LICENCIADO ou de seus usuários.</li>
                        <li>d) Falhas, vícios ou irregularidades relacionadas aos produtos, serviços e tecnologia utilizados pelo LICENCIADO, como falhas no hardware, falta de energia, instalação indevida ou má configuração do sistema operacional.</li>
                        <li>e) Mau funcionamento, erro ou problema decorrente do(s) Provedor(es), ou de sistema(s) relacionado(s) a terceiros.</li>
                        <li>f) Incompatibilidade de ferramentas, navegadores, plataformas digitais, que possam gerar indisponibilidade ou perda do serviço.</li>
                        <li>g) Qualquer mudança, perda ou informação geradas erroneamente por falha do(s) Provedor(es), bem como as mudanças de diretrizes do(s) mesmo(s).</li>
                    </ul>
                </li>

                <li>
                    6.3. Nenhuma das Partes será responsável, em qualquer
                    hipótese, por perda de receita ou lucro, assim como por lucros cessantes ou
                    emergentes, danos indiretos ou perdas de ordem concorrencial.
                </li>

                <li>
                    6.4. Exceto em casos de dolo ou culpa grave comprovada, a
                    responsabilidade total da ORACCLUM sob estes Termos (incluindo
                    responsabilidade por quebra de contrato, negligência ou outra causa) será
                    limitada, no máximo, ao valor total pago pelo LICENCIADO à ORACCLUM nos
                    últimos 6 (seis) meses anteriores ao evento que deu origem à reclamação.
                </li>
            </ol>

            <h2 className="font-bold my-small">
                7. CONFIDENCIALIDADE E PROTEÇÃO DE DADOS (LGPD)
            </h2>
            <ol className="space-y-3">
                <li>
                    7.1. As Partes se obrigam a manter o mais completo e absoluto
                    sigilo em relação a todos e quaisquer documentos, dados, informações,
                    projetos, especificações técnicas ou comerciais, inovações, aperfeiçoamento
                    da Plataforma e demais informações confidenciais que cheguem ao conhecimento
                    de qualquer das Partes em virtude do presente vínculo, durante sua vigência e
                    após sua extinção.

                    <ol className="mt-2 pl-[3rem]">
                        <li>
                            7.1.1. O dever de confidencialidade subsistirá por um
                            período mínimo de 5 (cinco) anos após o término da relação contratual.
                        </li>
                    </ol>
                </li>

                <li>
                    7.2. O LICENCIADO declara ter lido e aceito a Política de
                    Privacidade da ORACCLUM, documento obrigatório que detalha o tratamento dos
                    dados pessoais.

                    <ol className="mt-2 pl-[3rem] space-y-2">
                        <li>
                            7.2.1. Para fins da Lei Geral de Proteção de Dados
                            Pessoais (LGPD), o LICENCIADO (USUÁRIO) é o CONTROLADOR dos dados pessoais
                            de seus clientes/usuários inseridos nas campanhas de marketing, e a
                            ORACCLUM é a OPERADORA desses dados, atuando mediante as instruções do
                            LICENCIADO, no contexto da utilização da Plataforma.
                        </li>

                        <li>
                            7.2.2. A ORACCLUM, como OPERADORA:
                            <ul className="mt-2 pl-[3rem] list-none space-y-1">
                                <li>i) compromete-se a adotar medidas técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas;</li>
                                <li>ii) deverá comunicar o LICENCIADO, de forma imediata, sobre qualquer incidente de segurança que possa acarretar risco ou dano relevante aos dados pessoais;</li>
                                <li>iii) não utilizará os dados pessoais para finalidade distinta daquela prevista nestes Termos, tampouco os compartilhará com terceiros sem o consentimento do LICENCIADO;</li>
                                <li>iv) excluirá os dados pessoais tratados em até 90 (noventa) dias após o término da relação contratual, salvo obrigação legal de retenção;</li>
                                <li>v) seguirá as instruções documentadas do LICENCIADO quanto ao tratamento dos dados pessoais.</li>
                            </ul>
                        </li>
                    </ol>
                </li>

                <li>
                    7.3. O LICENCIADO será exclusivamente responsável por
                    coletar os consentimentos necessários junto aos titulares dos dados pessoais
                    inseridos em campanhas e demais interações realizadas por meio da
                    Plataforma.
                </li>
            </ol>

            <h2 className="font-bold my-small">
                8. DISPOSIÇÕES GERAIS E FORO
            </h2>
            <ol className="space-y-3">
                <li>
                    8.1. Aceite e prova. O LICENCIADO manifesta seu consentimento
                    com estes Termos mediante a utilização da Plataforma e/ou mediante aceite
                    digital inequívoco (click-wrap). Para fins de validade da contratação
                    eletrônica, o LICENCIADO desde já concorda com a coleta e registro pela
                    plataforma ORACCLUM dos logs imutáveis do aceite do LICENCIADO, contendo no
                    mínimo:
                    <ul className="mt-2 pl-[3rem] list-none space-y-1">
                        <li>(i) identificador do usuário,</li>
                        <li>(ii) endereço IP de origem,</li>
                        <li>(iii) data e horário (timestamp) do aceite.</li>
                    </ul>
                </li>

                <li>
                    8.2. Suporte técnico. O suporte técnico consiste no
                    esclarecimento de dúvidas pontuais quanto às funcionalidades e utilização,
                    e no registro e tratamento de erros da Plataforma. Nesta versão de
                    portfólio, este fluxo é demonstrativo e não representa um canal comercial
                    ativo.
                </li>

                <li>
                    8.3. Alterações unilaterais. A ORACCLUM poderá alterar estes
                    Termos a qualquer tempo. A nova versão será publicada no site. Para
                    alterações que restrinjam direitos ou alterem substancialmente as condições
                    de uso, a ORACCLUM exigirá um novo aceite do Usuário para o uso continuado da
                    Plataforma.
                </li>

                <li>
                    8.4. Legislação e foro. Estes Termos são mantidos como material
                    demonstrativo para o projeto de portfólio e não representam instrumento
                    contratual de uma operação comercial ativa.
                </li>

                <li>
                    8.5. Devolução e exclusão de dados. Em caso de término do
                    contrato, a ORACCLUM manterá os dados do LICENCIADO por um prazo de 90
                    (noventa) dias, para fins de exportação pelo LICENCIADO. Findo o prazo, os
                    dados serão excluídos de forma definitiva, ressalvadas as obrigações legais
                    ou regulatórias de retenção.
                </li>
            </ol>

        </div>
    );
}
