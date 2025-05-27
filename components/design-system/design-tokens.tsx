import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DesignTokens() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8">디자인 시스템</h1>

      <Tabs defaultValue="colors">
        <TabsList className="mb-6">
          <TabsTrigger value="colors">색상</TabsTrigger>
          <TabsTrigger value="typography">타이포그래피</TabsTrigger>
          <TabsTrigger value="spacing">여백</TabsTrigger>
          <TabsTrigger value="shadows">그림자</TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <ColorTokens />
        </TabsContent>

        <TabsContent value="typography">
          <TypographyTokens />
        </TabsContent>

        <TabsContent value="spacing">
          <SpacingTokens />
        </TabsContent>

        <TabsContent value="shadows">
          <ShadowTokens />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ColorTokens() {
  return (
    <div className="space-y-8">
      <section>
        <h2>기본 색상</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ColorCard name="Primary" className="bg-primary text-primary-foreground" />
          <ColorCard name="Secondary" className="bg-secondary text-secondary-foreground" />
          <ColorCard name="Accent" className="bg-accent text-accent-foreground" />
          <ColorCard name="Muted" className="bg-muted text-muted-foreground" />
          <ColorCard name="Destructive" className="bg-destructive text-destructive-foreground" />
          <ColorCard name="Success" className="bg-success text-success-foreground" />
          <ColorCard name="Warning" className="bg-warning text-warning-foreground" />
          <ColorCard name="Info" className="bg-info text-info-foreground" />
        </div>
      </section>

      <section>
        <h2>Primary 색상 스케일</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ColorCard name="Primary 50" className="bg-primary-50 text-primary-900" />
          <ColorCard name="Primary 100" className="bg-primary-100 text-primary-900" />
          <ColorCard name="Primary 200" className="bg-primary-200 text-primary-900" />
          <ColorCard name="Primary 300" className="bg-primary-300 text-primary-900" />
          <ColorCard name="Primary 400" className="bg-primary-400 text-primary-900" />
          <ColorCard name="Primary 500" className="bg-primary-500 text-primary-50" />
          <ColorCard name="Primary 600" className="bg-primary-600 text-primary-50" />
          <ColorCard name="Primary 700" className="bg-primary-700 text-primary-50" />
          <ColorCard name="Primary 800" className="bg-primary-800 text-primary-50" />
          <ColorCard name="Primary 900" className="bg-primary-900 text-primary-50" />
          <ColorCard name="Primary 950" className="bg-primary-950 text-primary-50" />
        </div>
      </section>

      <section>
        <h2>차트 색상</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div
              key={num}
              className={`h-20 rounded-md flex items-center justify-center text-white font-medium`}
              style={{ backgroundColor: `hsl(var(--chart-${num}))` }}
            >
              Chart {num}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ColorCard({ name, className }: { name: string; className: string }) {
  return <div className={`h-20 rounded-md flex items-center justify-center font-medium ${className}`}>{name}</div>
}

function TypographyTokens() {
  return (
    <div className="space-y-8">
      <section>
        <h2>제목</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="text-heading-1 font-bold">제목 1 (Heading 1)</div>
              <div className="text-muted-foreground">--font-size-heading-1: 2.5rem</div>
            </div>
            <div>
              <div className="text-heading-2 font-semibold">제목 2 (Heading 2)</div>
              <div className="text-muted-foreground">--font-size-heading-2: 2rem</div>
            </div>
            <div>
              <div className="text-heading-3 font-semibold">제목 3 (Heading 3)</div>
              <div className="text-muted-foreground">--font-size-heading-3: 1.5rem</div>
            </div>
            <div>
              <div className="text-heading-4 font-medium">제목 4 (Heading 4)</div>
              <div className="text-muted-foreground">--font-size-heading-4: 1.25rem</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2>본문</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="text-body-lg">본문 대형 (Body Large)</div>
              <div className="text-muted-foreground">--font-size-body-lg: 1.125rem</div>
            </div>
            <div>
              <div className="text-body-base">본문 기본 (Body Base)</div>
              <div className="text-muted-foreground">--font-size-body-base: 1rem</div>
            </div>
            <div>
              <div className="text-body-sm">본문 소형 (Body Small)</div>
              <div className="text-muted-foreground">--font-size-body-sm: 0.875rem</div>
            </div>
            <div>
              <div className="text-body-xs">본문 초소형 (Body XSmall)</div>
              <div className="text-muted-foreground">--font-size-body-xs: 0.75rem</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2>글꼴 가중치</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="text-body-lg font-light">Light (300)</div>
              <div className="text-muted-foreground">--font-weight-light: 300</div>
            </div>
            <div>
              <div className="text-body-lg font-normal">Normal (400)</div>
              <div className="text-muted-foreground">--font-weight-normal: 400</div>
            </div>
            <div>
              <div className="text-body-lg font-medium">Medium (500)</div>
              <div className="text-muted-foreground">--font-weight-medium: 500</div>
            </div>
            <div>
              <div className="text-body-lg font-semibold">Semibold (600)</div>
              <div className="text-muted-foreground">--font-weight-semibold: 600</div>
            </div>
            <div>
              <div className="text-body-lg font-bold">Bold (700)</div>
              <div className="text-muted-foreground">--font-weight-bold: 700</div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function SpacingTokens() {
  return (
    <div className="space-y-8">
      <section>
        <h2>여백 시스템</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[
                { name: "XS", value: "0.25rem", className: "spacing-xs" },
                { name: "SM", value: "0.5rem", className: "spacing-sm" },
                { name: "MD", value: "1rem", className: "spacing-md" },
                { name: "LG", value: "1.5rem", className: "spacing-lg" },
                { name: "XL", value: "2rem", className: "spacing-xl" },
                { name: "2XL", value: "3rem", className: "spacing-2xl" },
                { name: "3XL", value: "4rem", className: "spacing-3xl" },
              ].map((spacing) => (
                <div key={spacing.name} className="flex items-center">
                  <div className="w-20">{spacing.name}</div>
                  <div
                    className="bg-primary-200 dark:bg-primary-800"
                    style={{ height: "1rem", width: spacing.value }}
                  ></div>
                  <div className="ml-4 text-muted-foreground">{spacing.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ShadowTokens() {
  return (
    <div className="space-y-8">
      <section>
        <h2>그림자</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="h-24 bg-card shadow-sm flex items-center justify-center">Shadow SM</div>
              <div className="mt-4 text-muted-foreground text-sm">--shadow-sm</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-24 bg-card shadow-md flex items-center justify-center">Shadow MD</div>
              <div className="mt-4 text-muted-foreground text-sm">--shadow-md</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-24 bg-card shadow-lg flex items-center justify-center">Shadow LG</div>
              <div className="mt-4 text-muted-foreground text-sm">--shadow-lg</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-24 bg-card shadow-xl flex items-center justify-center">Shadow XL</div>
              <div className="mt-4 text-muted-foreground text-sm">--shadow-xl</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
