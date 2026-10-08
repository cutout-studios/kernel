createServer(() =>
  // middleware here
  <api accessControlAllowOrigin="*" contentType="json">
    <models get={() => {}}>
      <name parameter
        post={() => {}}
        patch={() => {}}
      />
    </models>
    <sessions>
      <id parameter>
        <turns post={() => {}} />
      </id>
    </sessions>
  </api>
);
