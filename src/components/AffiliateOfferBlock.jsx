export default function AffiliateOfferBlock({ title, description, disclosure, offers }) {
  if (!offers?.length) return null;

  return (
    <section className="affiliate-block" aria-labelledby="affiliate-title">
      <div className="affiliate-header">
        <div>
          <p className="eyebrow">Partner Offers</p>
          <h2 id="affiliate-title">{title}</h2>
        </div>
        <span>Sample</span>
      </div>
      <p>{description}</p>
      <div className="affiliate-table-wrap">
        <table className="affiliate-table">
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col">Sample offer</th>
              <th scope="col">Transfer fee</th>
              <th scope="col">Intro period</th>
              <th scope="col">Best for</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.name}>
                <th scope="row">
                  <span>{offer.name}</span>
                  <small>{offer.kicker}</small>
                </th>
                <td>{offer.summary}</td>
                <td>{offer.transferFee}</td>
                <td>{offer.introPeriod}</td>
                <td>{offer.bestFor}</td>
                <td>
                  <a href={offer.href} rel="sponsored nofollow noopener" target="_blank">
                    {offer.cta}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="affiliate-disclosure">{disclosure}</p>
    </section>
  );
}
