import { fireEvent, render } from "@testing-library/react";
import { IntegrationModal } from "./integrationModal";

const mockCampaign = {
  id: 42,
  external_id: "999",
  id_user: 7,
  name: "Campanha Taboola Teste",
  link: "https://example.com/funil",
  sub_account: null,
  ad_provider: "taboola",
  checkout_provider: "perfectpay",
  conversion_name: "Purchase",
  click_auth: "click-auth-xyz",
  summary: {
    checkout: 0,
    clicks: 0,
    cpa: 0,
    cpc: 0,
    expenses: 0,
    revenue: 0,
    roas: 0,
    sales: 0,
    vcpm: 0,
    vctr: 0,
  },
};

describe("IntegrationModal", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it("renders the refreshed shell with four navigation steps", () => {
    const view = render(
      <IntegrationModal
        campaign={mockCampaign}
        onCloseAction={() => {}}
      />
    );

    expect(view.getByText("Tutorial Taboola")).toBeInTheDocument();
    expect(
      view.getByRole("button", { name: "Fechar tutorial de integracao" })
    ).toBeInTheDocument();
    expect(view.getAllByText(/Passo 1/i).length).toBeGreaterThan(0);
    expect(view.getAllByText(/Passo 2/i).length).toBeGreaterThan(0);
    expect(view.getAllByText(/Passo 3/i).length).toBeGreaterThan(0);
    expect(view.getAllByText(/Passo 4/i).length).toBeGreaterThan(0);
    expect(
      view.getByRole("heading", {
        name: /integracao com o provedor de anuncios/i,
      })
    ).toBeInTheDocument();
  });

  it("shows the correct content when changing steps", () => {
    const view = render(
      <IntegrationModal
        campaign={mockCampaign}
        onCloseAction={() => {}}
      />
    );

    fireEvent.click(
      view.getAllByRole("button", { name: /integracao com funil/i })[0]
    );
    expect(
      view.getByText("Scripts da etapa selecionada")
    ).toBeInTheDocument();

    fireEvent.click(
      view.getAllByRole("button", { name: /integracao com checkout/i })[0]
    );
    expect(view.getByText("URL de postback")).toBeInTheDocument();

    fireEvent.click(
      view.getAllByRole("button", { name: /teste de integracao/i })[0]
    );
    expect(view.getByText("Status do funil de teste")).toBeInTheDocument();
  });

  it("preserves campaign derived values in the UTM and checkout steps", () => {
    const view = render(
      <IntegrationModal
        campaign={mockCampaign}
        onCloseAction={() => {}}
      />
    );

    expect(
      view.getByText(
        /utm_campaign=click-auth-xyz&campaign_id=\{campaign_id\}/i
      )
    ).toBeInTheDocument();

    fireEvent.click(
      view.getAllByRole("button", { name: /integracao com checkout/i })[0]
    );

    expect(
      view.getByText("http://localhost:5050/api/postback-perfectpay")
    ).toBeInTheDocument();
  });
});
