import { Col, Container, Row } from 'react-bootstrap'
import Cards from '@/app/(admin)/dashboards/components/Cards'
import Chart from '@/app/(admin)/dashboards/components/Chart'
import CountryMap from '@/app/(admin)/dashboards/components/CountryMap'
import SaleChart from '@/app/(admin)/dashboards/components/SaleChart'
import User from '@/app/(admin)/dashboards/components/User'
import PageTitle from '@/components/PageTitle'

const Dashboard = () => {
  return (
    <>
      <PageTitle title="Dashboard" subName="Main" />
      <Container fluid>
        <Row>
          <Col xl={3} md={6}>
            <Cards />
          </Col>
          <Col xl={3} md={6}>
            <Cards />
          </Col>
          <Col xl={3} md={6}>
            <Cards />
          </Col>
          <Col xl={3} md={6}>
            <Cards />
          </Col>
        </Row>

        <Row>
          <Col xl={8}>
            <Chart />
          </Col>
          <Col xl={4}>
            <SaleChart />
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <CountryMap />
          </Col>
          <Col xl={6}>
            <User />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Dashboard